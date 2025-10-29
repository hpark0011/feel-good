"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

interface SubTasksListProps {
  value: SubTask[];
  onChange: (subTasks: SubTask[]) => void;
}

export function SubTasksList({ value, onChange }: SubTasksListProps) {
  const [newTaskText, setNewTaskText] = useState("");

  const addSubTask = () => {
    if (newTaskText.trim()) {
      const newTask: SubTask = {
        id: crypto.randomUUID(),
        text: newTaskText.trim(),
        completed: false,
      };
      onChange([...value, newTask]);
      setNewTaskText("");
    }
  };

  const updateSubTask = (id: string, updates: Partial<SubTask>) => {
    onChange(
      value.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteSubTask = (id: string) => {
    onChange(value.filter((task) => task.id !== id));
  };

  const completedCount = value.filter((task) => task.completed).length;
  const totalCount = value.length;

  return (
    <div className='w-[calc(100%+12px)] ml-[-6px] border border-border-medium rounded-lg group hover:bg-hover px-2 py-1.5'>
      {/* Progress indicator */}
      {totalCount > 0 && (
        <div className='text-xs text-text-muted'>
          {completedCount}/{totalCount} completed
        </div>
      )}

      {/* Sub-tasks list */}
      <div>
        {value.map((task) => (
          <div key={task.id} className='flex items-center gap-3 rounded-md'>
            <Checkbox
              checked={task.completed}
              onCheckedChange={(checked) =>
                updateSubTask(task.id, { completed: !!checked })
              }
              className='border-border-medium'
            />
            <Input
              value={task.text}
              onChange={(e) => updateSubTask(task.id, { text: e.target.value })}
              className={cn(
                "flex-1 border-none bg-transparent p-0 focus-visible:ring-0 h-6",
                task.completed && "line-through text-text-muted"
              )}
            />
            <Button
              type='button'
              variant='icon'
              size='sm'
              onClick={() => deleteSubTask(task.id)}
              className='p-0 text-icon-light hover:text-icon-primary'
            >
              <Icon name='XmarkIcon' className='size-3.5' />
            </Button>
          </div>
        ))}
      </div>

      {/* Add new sub-task */}
      <div className='flex gap-2'>
        <Input
          placeholder='Add a sub-task...'
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSubTask();
            }
          }}
          className='flex-1 border-none'
        />
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={addSubTask}
          disabled={!newTaskText.trim()}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
