"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment-jalaali";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";

moment.loadPersian({ usePersianDigits: true });

const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

type SelectionMode = "single" | "multiple" | "range";

interface JalaliCalendarProps {
  mode?: SelectionMode;
}

export default function JalaliCalendar({
  mode = "single",
}: JalaliCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedDates, setSelectedDates] = useState<moment.Moment[]>([]);
  const [rangeStart, setRangeStart] = useState<moment.Moment | null>(null);
  const [rangeEnd, setRangeEnd] = useState<moment.Moment | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(mode);

  const startOfMonth = selectedDate.clone().startOf("jMonth");
  const endOfMonth = selectedDate.clone().endOf("jMonth");
  const startDate = startOfMonth
    .clone()
    .subtract((startOfMonth.day() + 1) % 7, "days");

  const calendarDays = [];
  const day = startDate.clone();
  while (day.isBefore(endOfMonth) || day.jDate() !== 1) {
    calendarDays.push(day.clone());
    day.add(1, "day");
  }

  const handlePrevMonth = () => {
    setSelectedDate(selectedDate.clone().subtract(1, "jMonth"));
  };

  const handleNextMonth = () => {
    setSelectedDate(selectedDate.clone().add(1, "jMonth"));
  };

  function reset() {
    setSelectedDate(moment());
    setSelectedDates([]);
    setRangeStart(null);
    setRangeEnd(null);
    setSelectionMode(mode);
  }

  const handleDateClick = (date: moment.Moment) => {
    switch (selectionMode) {
      case "single":
        setSelectedDate(date);
        setSelectedDates([date]);
        setRangeStart(null);
        setRangeEnd(null);
        break;
      case "multiple":
        setSelectedDates((prevDates) => {
          const index = prevDates.findIndex((d) => d.isSame(date, "day"));
          if (index > -1) {
            return [
              ...prevDates.slice(0, index),
              ...prevDates.slice(index + 1),
            ];
          } else {
            return [...prevDates, date];
          }
        });
        setRangeStart(null);
        setRangeEnd(null);
        break;
      case "range":
        if (date.isSame(rangeStart)) {
          reset();
        }

        if (!rangeStart) {
          // If no start date is set, set the start date to the clicked date and reset rangeEnd
          console.log("\x1b[35m" + `wrong` + "\x1b[0m");
          setRangeStart(date);
          setRangeEnd(null);
        } else {
          // If a start date is set, determine if the clicked date is before or after it
          if (date.isBefore(rangeStart)) {
            // If the clicked date is before the start date, update the start and end dates
            setRangeStart(date);
          } else {
            // If the clicked date is after the start date, set it as the end date
            setRangeEnd(date);
          }
        }
        setSelectedDates([]); // Clear selected dates after the range is set
        break;
    }
  };

  const isDateSelected = (date: moment.Moment) => {
    if (selectionMode === "single") return date.isSame(selectedDate, "day");

    if (selectionMode === "multiple")
      return selectedDates.some((d) => d.isSame(date, "day"));

    if (selectionMode === "range") {
      if (rangeStart && rangeEnd)
        return date.isBetween(rangeStart, rangeEnd, "day", "[]");

      if (rangeStart) return date.isSame(rangeStart, "day");
    }

    return false;
  };

  const isRangeStart = (date: moment.Moment) =>
    selectionMode === "range" && rangeStart && date.isSame(rangeStart, "day");

  const isRangeEnd = (date: moment.Moment) =>
    selectionMode === "range" && rangeEnd && date.isSame(rangeEnd, "day");

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold">
            {selectedDate.format("jMMMM jYYYY")}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center font-medium text-gray-500">
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => (
            <Button
              key={index}
              variant={isDateSelected(day) ? "default" : "ghost"}
              className={`h-10 ${
                day.jMonth() !== selectedDate.jMonth() ? "text-gray-400" : ""
              } ${isRangeStart(day) ? "rounded-r-full" : ""} ${
                isRangeEnd(day) ? "rounded-l-full" : ""
              }`}
              onClick={() => handleDateClick(day)}
            >
              {day.jDate()}
            </Button>
          ))}
        </div>
        <div className="mt-4 text-right">
          <p className="text-sm text-gray-700">
            {selectionMode === "single" &&
              `Selected: ${selectedDate.format("jYYYY/jMM/jDD")}`}
            {selectionMode === "multiple" &&
              `Selected: ${selectedDates
                .map((d) => d.format("jYYYY/jMM/jDD"))
                .join(", ")}`}
            {selectionMode === "range" &&
              `Range: ${
                rangeStart ? rangeStart.format("jYYYY/jMM/jDD") : ""
              } - ${rangeEnd ? rangeEnd.format("jYYYY/jMM/jDD") : ""}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
