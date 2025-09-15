import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoList from './TodoList';

function setup() {
  localStorage.clear();
  return render(<TodoList />);
}

test('adds a task with Enter and button', async () => {
  setup();
  const input = screen.getByPlaceholderText(/add a new task/i);

  await userEvent.type(input, 'Task A{enter}');
  expect(screen.getByText('Task A')).toBeInTheDocument();

  await userEvent.type(input, 'Task B');
  await userEvent.click(screen.getByRole('button', { name: /add/i }));
  expect(screen.getByText('Task B')).toBeInTheDocument();
});

test('toggle completes via checkbox', async () => {
  setup();
  const input = screen.getByPlaceholderText(/add a new task/i);
  await userEvent.type(input, 'Walk dog{enter}');
  const checkbox = screen.getByRole('checkbox');
  expect(checkbox).not.toBeChecked();
  await userEvent.click(checkbox);
  expect(checkbox).toBeChecked();
});

test('filters active and completed', async () => {
  setup();
  const input = screen.getByPlaceholderText(/add a new task/i);
  await userEvent.type(input, 'A{enter}');
  await userEvent.type(input, 'B{enter}');
  const [cb1] = screen.getAllByRole('checkbox');
  await userEvent.click(cb1); // complete first

  await userEvent.click(screen.getByRole('button', { name: /active/i }));
  expect(screen.queryByText('A')).not.toBeInTheDocument();
  expect(screen.getByText('B')).toBeInTheDocument();

  const completedFilter = screen.getAllByRole('button', { name: /completed/i }).find(b => b.className.includes('todo-filter'));
  await userEvent.click(completedFilter);
  expect(screen.getByText('A')).toBeInTheDocument();
  expect(screen.queryByText('B')).not.toBeInTheDocument();
});

test('edit a task inline', async () => {
  setup();
  const input = screen.getByPlaceholderText(/add a new task/i);
  await userEvent.type(input, 'Edit me{enter}');
  const label = screen.getByText('Edit me');
  await userEvent.dblClick(label);
  const editor = screen.getByDisplayValue('Edit me');
  await userEvent.clear(editor);
  await userEvent.type(editor, 'Edited{enter}');
  expect(screen.getByText('Edited')).toBeInTheDocument();
});

test('clear completed removes completed tasks', async () => {
  setup();
  const input = screen.getByPlaceholderText(/add a new task/i);
  await userEvent.type(input, 'A{enter}');
  await userEvent.type(input, 'B{enter}');
  const [cb1] = screen.getAllByRole('checkbox');
  await userEvent.click(cb1);

  const clearBtn = screen.getByRole('button', { name: /clear completed/i });
  await userEvent.click(clearBtn);
  expect(screen.queryByText('A')).not.toBeInTheDocument();
  expect(screen.getByText('B')).toBeInTheDocument();
});

test('undo delete restores task', async () => {
  setup();
  const input = screen.getByPlaceholderText(/add a new task/i);
  await userEvent.type(input, 'Undo me{enter}');
  await userEvent.click(screen.getByRole('button', { name: /delete/i }));
  const undo = await screen.findByRole('button', { name: /undo/i });
  await userEvent.click(undo);
  expect(screen.getByText('Undo me')).toBeInTheDocument();
});
