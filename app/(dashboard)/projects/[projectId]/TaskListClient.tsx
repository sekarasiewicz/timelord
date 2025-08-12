'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

type TaskItem = {
  id: string
  name: string
  description?: string | null
  monthTotalMs: number
  activeEntry?: { id: string; startTime: string }
}

export default function TaskListClient({ projectId, tasks }: { projectId: string; tasks: TaskItem[] }) {
  const router = useRouter()

  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')

  async function createTask() {
    if (!newTaskName.trim()) return
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        name: newTaskName,
        description: newTaskDesc,
      }),
    })
    setNewTaskName('')
    setNewTaskDesc('')
    router.refresh()
  }

  async function deleteTask(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    router.refresh()
  }

  async function start(taskId: string) {
    await fetch('/api/time-entries/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    })
    router.refresh()
  }

  async function stop(taskId: string) {
    await fetch('/api/time-entries/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    })
    router.refresh()
  }

  async function addManual(taskId: string, start: string, end: string) {
    if (!start || !end) return
    await fetch('/api/time-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId,
        startTime: start,
        endTime: end,
        manual: true,
      }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div className="border rounded p-3 space-y-2">
        <div className="text-sm font-medium">New Task</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input placeholder="Name" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} />
          <input
            placeholder="Description (optional)"
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
          />
          <Button onClick={createTask}>Create</Button>
        </div>
      </div>

      {tasks.map((t) => (
        <TaskRow
          key={t.id}
          task={t}
          onStart={() => start(t.id)}
          onStop={() => stop(t.id)}
          onDelete={() => deleteTask(t.id)}
          onAddManual={(s, e) => addManual(t.id, s, e)}
        />
      ))}
      {tasks.length === 0 && <div className="text-sm text-neutral-600">No tasks</div>}
    </div>
  )
}

function TaskRow({
  task,
  onStart,
  onStop,
  onDelete,
  onAddManual,
}: {
  task: TaskItem
  onStart(): void
  onStop(): void
  onDelete(): void
  onAddManual(start: string, end: string): void
}) {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  return (
    <div className="border rounded p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="font-medium">{task.name}</div>
          {task.description && <div className="text-xs text-neutral-600 dark:text-neutral-400">{task.description}</div>}
        </div>
        <div className="flex items-center gap-2">
          {task.activeEntry ? (
            <Button className="bg-orange-600 text-white rounded px-3 py-1" onClick={onStop}>
              Pause
            </Button>
          ) : (
            <Button className="bg-green-600 text-white rounded px-3 py-1" onClick={onStart}>
              Play
            </Button>
          )}
          <Button className="border rounded px-3 py-1" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        <Button className="border rounded px-3 py-2" onClick={() => onAddManual(start, end)}>
          Add manual time
        </Button>
      </div>
    </div>
  )
}
