import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date | undefined): string {
    if (!value) return 'Just now';

    const date = typeof value === 'string' ? new Date(value) : value;
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Less than 30 seconds
    if (seconds < 30) return 'Just now';

    // Less than a minute
    if (seconds < 60) return `${seconds} seconds ago`;

    // Less than an hour
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }

    // Less than a day
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    // Less than a week
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }

    // Less than a month (approx 30 days)
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    }

    // Less than a year
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} month${months === 1 ? '' : 's'} ago`;
    }

    // More than a year
    const years = Math.floor(days / 365);
    return `${years} year${years === 1 ? '' : 's'} ago`;
  }
}
