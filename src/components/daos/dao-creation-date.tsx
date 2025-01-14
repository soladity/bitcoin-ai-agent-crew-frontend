import { format } from "date-fns";

interface DAOCreationDateProps {
  createdAt: string;
}

export function DAOCreationDate({ createdAt }: DAOCreationDateProps) {
  return (
    <div className="text-sm text-muted-foreground mt-8">
      Created {format(new Date(createdAt), "PPpp")}
    </div>
  );
}
