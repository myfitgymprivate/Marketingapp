"use client";

import { useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  detail: string;
  priority: "Běžná" | "Vysoká";
  completed: boolean;
};

const initialTasks: Task[] = [
  {
    id: "shots",
    title: "Připravit záběry pro Reel",
    detail: "Zítra · obsah „5 důvodů vzít parťáka“",
    priority: "Vysoká",
    completed: false,
  },
  {
    id: "photos",
    title: "Nahrát fotografie prostoru",
    detail: "Pátek · Media Library",
    priority: "Běžná",
    completed: false,
  },
  {
    id: "plan",
    title: "Potvrdit měsíční plán",
    detail: "25. srpna · září 2026",
    priority: "Běžná",
    completed: false,
  },
  {
    id: "story",
    title: "Publikovat Story „Cvičení ve dvou“",
    detail: "Pondělí · dokončeno",
    priority: "Běžná",
    completed: true,
  },
  {
    id: "links",
    title: "Zkontrolovat CTA odkazy",
    detail: "Minulý pátek · dokončeno",
    priority: "Běžná",
    completed: true,
  },
];

export function TasksWorkspace() {
  const [tasks, setTasks] = useState(initialTasks);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem("myfit-tasks");
      if (saved) setTasks(JSON.parse(saved) as Task[]);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  function persist(nextTasks: Task[]) {
    setTasks(nextTasks);
    window.localStorage.setItem("myfit-tasks", JSON.stringify(nextTasks));
  }

  function addTask() {
    if (!title.trim()) return;
    persist([
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        detail: "Nový úkol · bez termínu",
        priority: "Běžná",
        completed: false,
      },
      ...tasks,
    ]);
    setTitle("");
    setFormOpen(false);
  }

  function toggleTask(id: string) {
    persist(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  const openTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <>
      <div className="header-action-row">
        <button
          className="primary-button"
          onClick={() => setFormOpen((current) => !current)}
          type="button"
        >
          {formOpen ? "Zavřít" : "+ Nový úkol"}
        </button>
      </div>
      {formOpen ? (
        <section className="panel quick-task-form">
          <label>
            Co je potřeba udělat?
            <input
              autoFocus
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addTask();
              }}
              value={title}
            />
          </label>
          <button
            className="primary-button"
            disabled={!title.trim()}
            onClick={addTask}
            type="button"
          >
            Přidat úkol
          </button>
        </section>
      ) : null}
      <div className="task-columns">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow accent">Tento týden</p>
              <h2>Marketingová realizace</h2>
            </div>
            <span className="type-badge">{openTasks.length}</span>
          </div>
          <ul className="task-list">
            {openTasks.map((task) => (
              <li key={task.id}>
                <button
                  aria-label={`Dokončit: ${task.title}`}
                  onClick={() => toggleTask(task.id)}
                  type="button"
                >
                  ○
                </button>
                <div>
                  <strong>{task.title}</strong>
                  <small>{task.detail}</small>
                </div>
                <span
                  className={`priority-tag ${task.priority === "Vysoká" ? "high" : ""}`}
                >
                  {task.priority}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Dokončeno</p>
              <h2>Poslední kontroly</h2>
            </div>
          </div>
          <ul className="task-list completed-list">
            {completedTasks.map((task) => (
              <li key={task.id}>
                <button
                  aria-label={`Vrátit mezi otevřené: ${task.title}`}
                  onClick={() => toggleTask(task.id)}
                  type="button"
                >
                  ✓
                </button>
                <div>
                  <strong>{task.title}</strong>
                  <small>{task.detail}</small>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
