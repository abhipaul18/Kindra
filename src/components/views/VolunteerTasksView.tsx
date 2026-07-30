import React, { useState } from 'react';
import type { VolunteerTask } from '../../types/database';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';

export interface VolunteerTasksViewProps {
  tasks: VolunteerTask[];
  onJoinTask: (taskId: string) => void;
}

export const VolunteerTasksView: React.FC<VolunteerTasksViewProps> = ({ tasks, onJoinTask }) => {
  const [joinedTasks, setJoinedTasks] = useState<string[]>([]);

  const handleJoin = (taskId: string) => {
    setJoinedTasks((prev) => [...prev, taskId]);
    onJoinTask(taskId);
  };

  return (
    <div className="flex flex-col gap-lg py-md px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-3xl">volunteer_activism</span>
            Volunteer Opportunities
          </h1>
          <p className="text-sm text-on-surface-variant">
            Join community cleanup drives, tree planting, and local civic projects to earn Karma points.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {tasks.map((task) => {
          const isJoined = joinedTasks.includes(task.id);
          return (
            <Card key={task.id} accentBorder="green" className="gap-md">
              <div className="flex justify-between items-start">
                <Chip variant="secondary">{task.category}</Chip>
                <Chip variant="amber" icon="workspace_premium">
                  +{task.karma_reward} Karma
                </Chip>
              </div>

              <div>
                <h3 className="text-xl font-bold text-on-surface mb-1">{task.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{task.description}</p>
              </div>

              <div className="flex flex-col gap-1 text-xs text-outline font-medium bg-surface-container-low p-3 rounded-lg border border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                  <span>{task.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-primary">event</span>
                  <span>{new Date(task.date_time).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-primary">group</span>
                  <span>{task.signed_up_count || 5} of {task.required_volunteers} volunteers registered</span>
                </div>
              </div>

              <Button
                variant={isJoined ? 'outline' : 'secondary'}
                icon={isJoined ? 'check' : 'person_add'}
                disabled={isJoined}
                onClick={() => handleJoin(task.id)}
                className="w-full font-bold"
              >
                {isJoined ? 'Registered for Task' : 'Sign Up as Volunteer'}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
