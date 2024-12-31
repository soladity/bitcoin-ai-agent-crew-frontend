import { format } from "date-fns";

interface CollectiveCreationDateProps {
  createdAt: string;
}

export function CollectiveCreationDate({ createdAt }: CollectiveCreationDateProps) {
  return (
    <div className="text-sm text-muted-foreground mt-8">
      Created {format(new Date(createdAt), "PPpp")}
    </div>
  );
}
