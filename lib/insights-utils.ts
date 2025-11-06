import type { Ticket, Project } from "@/types/board.types";

/**
 * Checks if two dates are on the same calendar day
 *
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns True if both dates are on the same day
 *
 * @example
 * isSameDay(new Date('2024-01-15 10:00'), new Date('2024-01-15 16:00')) // true
 * isSameDay(new Date('2024-01-15'), new Date('2024-01-16')) // false
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Filters tickets that were completed on a specific date
 *
 * @param tickets - Array of tickets to filter
 * @param date - Target date to filter by
 * @returns Array of tickets completed on the specified date
 *
 * @example
 * const todayTasks = getTasksCompletedOnDate(allTickets, new Date());
 */
export function getTasksCompletedOnDate(
  tickets: Ticket[],
  date: Date
): Ticket[] {
  return tickets.filter((ticket) => {
    if (!ticket.completedAt) return false;
    const completedDate = new Date(ticket.completedAt);
    return isSameDay(completedDate, date);
  });
}

/**
 * Gets time entries for a ticket that occurred on a specific date
 *
 * @param ticket - Ticket to get entries from
 * @param date - Target date to filter by
 * @returns Array of time entries that occurred on the specified date
 */
export function getTimeEntriesForDate(
  ticket: Ticket,
  date: Date
): import("@/types/board.types").TimeEntry[] {
  if (!ticket.timeEntries || ticket.timeEntries.length === 0) {
    return [];
  }

  return ticket.timeEntries.filter((entry) => {
    const entryDate = new Date(entry.end);
    return isSameDay(entryDate, date);
  });
}

/**
 * Calculates total duration for tickets on a specific date
 *
 * Only includes time from entries that occurred on the selected date,
 * not the lifetime total duration of the ticket.
 *
 * @param tickets - Array of tickets
 * @param date - Target date to calculate duration for
 * @returns Total duration in seconds for the specified date
 *
 * @example
 * const todaySeconds = calculateTotalDuration(allTickets, new Date());
 */
export function calculateTotalDuration(
  tickets: Ticket[],
  date: Date
): number {
  return tickets.reduce((sum, ticket) => {
    const entriesForDate = getTimeEntriesForDate(ticket, date);
    const dailyDuration = entriesForDate.reduce(
      (entrySum, entry) => entrySum + entry.duration,
      0
    );
    return sum + dailyDuration;
  }, 0);
}

/**
 * Calculates duration for a specific ticket on a specific date
 *
 * @param ticket - Ticket to calculate duration for
 * @param date - Target date
 * @returns Duration in seconds for the specified date
 */
export function getTicketDurationForDate(
  ticket: Ticket,
  date: Date
): number {
  const entries = getTimeEntriesForDate(ticket, date);
  return entries.reduce((sum, entry) => sum + entry.duration, 0);
}

/**
 * Groups completed tasks by project and calculates aggregate metrics for a specific date
 *
 * @param tickets - Array of tickets to group
 * @param projects - Array of available projects
 * @param date - Target date to calculate durations for
 * @returns Array of project summaries with task counts and durations
 *
 * @example
 * const projectStats = groupByProject(completedTasks, allProjects, new Date());
 */
export function groupByProject(
  tickets: Ticket[],
  projects: Project[],
  date: Date
): {
  projectId: string | null;
  projectName: string;
  projectColor: string;
  duration: number;
  taskCount: number;
}[] {
  const projectMap = new Map<string | null, {
    duration: number;
    taskCount: number;
  }>();

  // Initialize with null project for unassigned tasks
  projectMap.set(null, { duration: 0, taskCount: 0 });

  // Aggregate by project
  for (const ticket of tickets) {
    const projectId = ticket.projectId || null;
    const current = projectMap.get(projectId) || { duration: 0, taskCount: 0 };
    const dailyDuration = getTicketDurationForDate(ticket, date);

    // Only count tasks that have duration on this date
    if (dailyDuration > 0) {
      projectMap.set(projectId, {
        duration: current.duration + dailyDuration,
        taskCount: current.taskCount + 1,
      });
    }
  }

  // Convert to array with project details
  const result = [];

  for (const [projectId, stats] of projectMap.entries()) {
    if (stats.taskCount === 0) continue; // Skip projects with no tasks

    if (projectId === null) {
      result.push({
        projectId: null,
        projectName: "Unassigned",
        projectColor: "gray",
        duration: stats.duration,
        taskCount: stats.taskCount,
      });
    } else {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        result.push({
          projectId: project.id,
          projectName: project.name,
          projectColor: project.color,
          duration: stats.duration,
          taskCount: stats.taskCount,
        });
      }
    }
  }

  // Sort by duration (highest first)
  return result.sort((a, b) => b.duration - a.duration);
}
