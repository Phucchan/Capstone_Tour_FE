
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-schedule-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-calendar.component.html'
})
export class ScheduleCalendarComponent implements OnInit {
  @Input() schedules: any[] = [];

  weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  selectedMonth = new Date();
  availableMonths: Date[] = [];

  calendarDays: { date: Date, schedule?: any }[] = [];

  ngOnInit(): void {
    this.prepareMonths();
    this.generateCalendar();
  }

  prepareMonths(): void {
    const monthsSet = new Set<string>();
    for (let sch of this.schedules) {
      const date = new Date(sch.departureDate);
      monthsSet.add(`${date.getFullYear()}-${date.getMonth()}`);
    }

    this.availableMonths = Array.from(monthsSet).map(key => {
      const [y, m] = key.split('-').map(Number);
      return new Date(y, m);
    }).sort((a, b) => a.getTime() - b.getTime());
    this.selectedMonth = this.availableMonths[0] || new Date();
  }

  selectMonth(month: Date) {
    this.selectedMonth = month;
    this.generateCalendar();
  }

  generateCalendar(): void {
    const year = this.selectedMonth.getFullYear();
    const month = this.selectedMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const startOffset = (firstDay.getDay() + 6) % 7; // T2 = 0
    this.calendarDays = [];

    for (let i = 0; i < startOffset; i++) {
      this.calendarDays.push({ date: new Date(year, month, -startOffset + i + 1) });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const found = this.schedules.find(s =>
        new Date(s.departureDate).toDateString() === currentDate.toDateString()
      );
      this.calendarDays.push({ date: currentDate, schedule: found });
    }
  }
}
