import { useState } from "react";
import { gql, useQuery, useMutation, useSubscription } from "@apollo/client";
import { observer } from "mobx-react-lite";
import { ListTodo, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { cn } from "@/lib/utils.js";

const TODOS = gql`
  query Todos {
    todos {
      id
      title
      completed
      createdAt
      updatedAt
    }
  }
`;

const CREATE_TODO = gql`
  mutation CreateTodo($title: String!) {
    createTodo(title: $title) {
      id
      title
      completed
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_TODO = gql`
  mutation UpdateTodo($id: ID!, $title: String, $completed: Boolean) {
    updateTodo(id: $id, title: $title, completed: $completed) {
      id
      title
      completed
      createdAt
      updatedAt
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id)
  }
`;

const TODOS_UPDATED = gql`
  subscription TodosUpdated {
    todosUpdated
  }
`;

export const TodoList = observer(function TodoList() {
  const [newTitle, setNewTitle] = useState("");
  const { data, loading, error, refetch } = useQuery(TODOS, {
    pollInterval: 3000, // Auto-refresh every 3s so other clients (desktop/web) see changes without reload
  });
  useSubscription(TODOS_UPDATED, {
    onData: () => refetch(),
  });
  const [createTodo, { loading: creating }] = useMutation(CREATE_TODO, {
    refetchQueries: [{ query: TODOS }],
  });
  const [updateTodo] = useMutation(UPDATE_TODO, {
    refetchQueries: [{ query: TODOS }],
  });
  const [deleteTodo] = useMutation(DELETE_TODO, {
    refetchQueries: [{ query: TODOS }],
  });

  const todos = data?.todos ?? [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    try {
      await createTodo({ variables: { title } });
      setNewTitle("");
    } catch {
      // Error shown by Apollo / UI
    }
  };

  const handleToggle = (id: string, completed: boolean) => {
    updateTodo({ variables: { id, completed: !completed } });
  };

  const handleDelete = (id: string) => {
    deleteTodo({ variables: { id } });
  };

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 overflow-auto">
        <p className="text-destructive">Failed to load todos: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 overflow-auto">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <ListTodo className="h-7 w-7" />
          Todos
        </h1>
        <p className="text-muted-foreground">Create and manage your tasks</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Add todo</CardTitle>
          <CardDescription>Enter a title and press Add</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              placeholder="What needs to be done?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              maxLength={500}
              className="flex-1"
            />
            <Button type="submit" disabled={creating || !newTitle.trim()}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>List</CardTitle>
          <CardDescription>
            {todos.length === 0
              ? "No todos yet."
              : `${todos.filter((t: { completed: boolean }) => t.completed).length} of ${todos.length} completed`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ul className="space-y-2">
              {todos.map((todo: { id: string; title: string; completed: boolean }) => (
                <li
                  key={todo.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-border px-3 py-2",
                    todo.completed && "opacity-60"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleToggle(todo.id, todo.completed)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-input"
                    aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {todo.completed && (
                      <span className="text-primary text-xs font-bold">✓</span>
                    )}
                  </button>
                  <span
                    className={cn(
                      "flex-1 text-left",
                      todo.completed && "text-muted-foreground line-through"
                    )}
                  >
                    {todo.title}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(todo.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
});
