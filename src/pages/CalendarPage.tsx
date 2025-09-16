import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import "../components/LeftSidebar.css"; // Reuse sidebar styles for consistency
import { useNavigate } from "react-router-dom";

const today = new Date();
today.setHours(0, 0, 0, 0); // Set to midnight to compare dates accurately

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  // Returns 0 (Sunday) to 6 (Saturday)
  return new Date(year, month, 1).getDay();
}

interface Task {
  id: string;
  name: string;
  question: string;
  idealPrompt: string;
  Image?: unknown[];
  Day?: string;
}

interface CompletedTask {
  taskId: string;
  taskName: string;
  taskDay: string;
  score: number;
  percentageScore: number;
  attempts: number;
  completedAt: string;
}

interface CalendarPageProps {
  userId: string;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ userId }) => {
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed, 5 = June
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all tasks
        const tasksRes = await axios.get(`${API_BASE}/users/${userId}/tasks`);
        // Sort tasks by day
        const sortedTasks = (tasksRes.data.data || []).sort(
          (a: Task, b: Task) => {
            if (a.Day && b.Day) {
              return new Date(a.Day).getTime() - new Date(b.Day).getTime();
            }
            return 0;
          }
        );
        setTasks(sortedTasks);

        // Fetch completed tasks
        const completedRes = await axios.get(
          `${API_BASE}/users/${userId}/completed-tasks`
        );
        setCompletedTasks(completedRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth); // 0 = Sunday

  // Build weeks: each week is an array of 7 cells (null or day number)
  const weeks: (number | null)[][] = [];
  let day = 1;
  for (let w = 0; w < 6; w++) {
    const week: (number | null)[] = [];
    for (let d = 0; d < 7; d++) {
      if ((w === 0 && d < firstDayOfWeek) || day > daysInMonth) {
        week.push(null);
      } else {
        week.push(day);
        day++;
      }
    }
    weeks.push(week);
    if (day > daysInMonth) break;
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Get task status for a specific day
  const getTaskStatusForDay = (day: number) => {
    const dayDate = new Date(currentYear, currentMonth, day);
    dayDate.setHours(0, 0, 0, 0);

    const taskForDay = tasks.find((task) => {
      if (typeof task.Day === "string") {
        const taskDate = new Date(task.Day);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === dayDate.getTime();
      }
      return false;
    });

    if (!taskForDay) {
      return {
        hasTask: false,
        isCompleted: false,
        isLocked: true,
        task: null,
        completedTask: null,
      };
    }

    const completedTask = completedTasks.find(
      (completed) => completed.taskId === taskForDay.id
    );
    const isCompleted = !!completedTask;

    // Locking logic
    let isLocked = false;
    const taskIndex = tasks.findIndex((t) => t.id === taskForDay.id);

    if (dayDate > today) {
      // For future tasks, check sequential unlocking.
      if (taskIndex > 0) {
        const prevTask = tasks[taskIndex - 1];
        const prevCompletedTask = completedTasks.find(
          (ct) => ct.taskId === prevTask.id
        );
        if (!prevCompletedTask || prevCompletedTask.percentageScore < 50) {
          isLocked = true;
        }
      } else {
        // The very first task, if it's in the future, is locked.
        isLocked = true;
      }
    }
    // For tasks on today or in the past, isLocked remains false.

    return {
      hasTask: true,
      isCompleted,
      isLocked,
      task: taskForDay,
      completedTask: completedTask || null,
    };
  };

  const handleDayClick = (day: number) => {
    const status = getTaskStatusForDay(day);
    if (status.hasTask && status.task && !status.isLocked) {
      navigate(`/task/${status.task.id}`);
    }
  };

  // Format task details for tooltip
  const formatTaskTooltip = (day: number) => {
    const status = getTaskStatusForDay(day);
    if (!status.hasTask || !status.task) return null;

    const task = status.task;
    const completedTask = status.completedTask;

    if (status.isLocked) {
      return (
        <div
          style={{
            background: "rgba(0, 0, 0, 0.9)",
            color: "white",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            maxWidth: "300px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            zIndex: 1000,
            lineHeight: "1.4",
          }}
        >
          <div
            style={{ fontWeight: "600", marginBottom: "8px", color: "#ffd700" }}
          >
            {task.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            "🔒" <span>Locked</span>
          </div>
          <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "8px" }}>
            Complete the previous day's challenge with 50% or more to unlock.
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          background: "rgba(0, 0, 0, 0.9)",
          color: "white",
          padding: "12px 16px",
          borderRadius: "8px",
          fontSize: "14px",
          maxWidth: "300px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          zIndex: 1000,
          lineHeight: "1.4",
        }}
      >
        <div
          style={{ fontWeight: "600", marginBottom: "8px", color: "#ffd700" }}
        >
          {task.name}
        </div>
        <div style={{ marginBottom: "6px" }}>
          <strong>Status:</strong>{" "}
          {status.isCompleted ? "✅ Completed" : "❌ Not Started"}
        </div>
        {completedTask && (
          <>
            <div style={{ marginBottom: "4px" }}>
              <strong>Score:</strong> {completedTask.score.toFixed(1)}/5.0 (
              {completedTask.percentageScore}%)
            </div>
            <div style={{ marginBottom: "4px" }}>
              <strong>Attempts:</strong> {completedTask.attempts}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>
              Completed:{" "}
              {new Date(completedTask.completedAt).toLocaleDateString()}
            </div>
          </>
        )}
        {!completedTask && (
          <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
            Click to start this challenge
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        background: "#fdf7ef",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: "100vw",
          maxHeight: "100vh",
          background: "#fff7e6",
          borderRadius: 24,
          boxShadow: "0 2px 8px #f4e2c6",
          padding: 32,
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: 28,
            marginBottom: 24,
          }}
        >
          Select Challenge By Date
        </h2>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <button
            onClick={handlePrevMonth}
            style={{
              background: "#fff",
              border: "1px solid #e0c9a6",
              borderRadius: "50%",
              width: 40,
              height: 40,
              fontSize: 24,
              cursor: "pointer",
              color: "#d6a16d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            &lt;
          </button>
          <span style={{ fontWeight: 600, fontSize: 20, margin: "0 24px" }}>
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            style={{
              background: "#fff",
              border: "1px solid #e0c9a6",
              borderRadius: "50%",
              width: 40,
              height: 40,
              fontSize: 24,
              cursor: "pointer",
              color: "#d6a16d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 16,
            }}
          >
            &gt;
          </button>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", margin: 32 }}>
            Loading tasks...
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", color: "red", margin: 32 }}>
            {error}
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 0,
                marginBottom: 8,
                textAlign: "center",
                color: "#bfa77a",
                fontWeight: 600,
              }}
            >
              <div>S</div>
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 0,
              }}
            >
              {weeks.map((week, wi) =>
                week.map((d, di) => {
                  if (!d) {
                    return <div key={wi + "-" + di}></div>;
                  }

                  const status = getTaskStatusForDay(d);
                  const hasTask = status.hasTask;
                  const isCompleted = status.isCompleted;
                  const isLocked = status.isLocked;

                  const isToday =
                    d === today.getDate() &&
                    currentMonth === today.getMonth() &&
                    currentYear === today.getFullYear();

                  let background = "#f0f0f0";
                  let border = "1px solid #e0e0e0";
                  let color = "#ccc";
                  let cursor = "not-allowed";
                  let opacity = 0.5;

                  if (hasTask) {
                    if (isLocked) {
                      background = "#e9e9e9";
                      border = "1px solid #d0d0d0";
                      color = "#aaa";
                      cursor = "not-allowed";
                      opacity = 0.7;
                    } else {
                      background = isCompleted ? "#e8f5e8" : "#f7f6f4";
                      border = isCompleted
                        ? "1px solid #4caf50"
                        : "1px solid #e0c9a6";
                      color = isToday ? "#bfa77a" : "#888";
                      cursor = "pointer";
                      opacity = 1;
                    }
                  }

                  return (
                    <div
                      key={wi + "-" + di}
                      onClick={
                        hasTask && !isLocked
                          ? () => handleDayClick(d)
                          : undefined
                      }
                      onMouseEnter={(e) => {
                        if (hasTask) {
                          setHoveredDay(d);
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipPosition({
                            x: rect.left + rect.width / 2,
                            y: rect.top - 10,
                          });
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredDay(null);
                        setTooltipPosition(null);
                      }}
                      style={{
                        height: 70,
                        minHeight: 70,
                        borderRadius: 10,
                        background,
                        border,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: 18,
                        color,
                        position: "relative",
                        margin: 4,
                        boxSizing: "border-box",
                        boxShadow:
                          hasTask && !isLocked && isToday
                            ? "0 2px 8px #f4e2c6"
                            : "none",
                        transition:
                          "background 0.2s, border 0.2s, transform 0.1s",
                        cursor,
                        opacity,
                        transform:
                          hasTask && hoveredDay === d
                            ? "scale(1.05)"
                            : "scale(1)",
                      }}
                    >
                      <span>{d}</span>
                      {hasTask && (
                        <span
                          style={{
                            fontSize: 22,
                            position: "absolute",
                            bottom: 6,
                          }}
                        >
                          {isLocked ? (
                            "🔒"
                          ) : isCompleted ? (
                            <span style={{ color: "#4caf50" }}>✓</span>
                          ) : (
                            <span style={{ color: "#e57373" }}>✗</span>
                          )}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 24,
            marginTop: 32,
            fontSize: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#4caf50", fontSize: 22 }}>✓</span> Completed
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#e57373", fontSize: 22 }}>✗</span> Not
            Completed
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            🔒 Locked
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay !== null && tooltipPosition && (
        <div
          style={{
            position: "fixed",
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: "translateX(-50%) translateY(-100%)",
            pointerEvents: "none",
            zIndex: 1000,
            animation: "fadeIn 0.2s ease-in-out",
          }}
        >
          {formatTaskTooltip(hoveredDay)}
        </div>
      )}

      {/* CSS Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-100%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(-100%) translateY(0px);
          }
        }
      `}</style>
    </div>
  );
};

export default CalendarPage;
