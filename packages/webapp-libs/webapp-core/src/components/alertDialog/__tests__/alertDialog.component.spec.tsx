import { fireEvent, screen } from '@testing-library/react';
import React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../';
import { render } from '../../../tests/utils/rendering';

const triggerText = 'Open';
const titleText = 'Title';
const descriptionText = 'Description';
const cancelCTA = 'Cancel';
const actionCTA = 'Continue';

const Component = () => (
  <AlertDialog>
    <AlertDialogTrigger>{triggerText}</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{titleText}</AlertDialogTitle>
        <AlertDialogDescription>{descriptionText}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{cancelCTA}</AlertDialogCancel>
        <AlertDialogAction>{actionCTA}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

describe('AlertDialog: Component', () => {
  it('should render trigger only when not pressed', async () => {
    render(<Component />);

    expect(await screen.findByText(triggerText)).toBeInTheDocument();
    expect(screen.queryByText(titleText)).not.toBeInTheDocument();
  });

  it('should render content when pressed', async () => {
    render(<Component />);

    expect(screen.queryByText(titleText)).not.toBeInTheDocument();
    expect(screen.queryByText(descriptionText)).not.toBeInTheDocument();

    const button = await screen.findByText(triggerText);
    fireEvent.click(button);

    expect(await screen.findByText(titleText)).toBeInTheDocument();
    expect(await screen.findByText(descriptionText)).toBeInTheDocument();
  });
});
