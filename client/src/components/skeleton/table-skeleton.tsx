import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const TableSkeleton = () => {
  const loadingRows = Array.from({ length: 5 }, (_, i) => i);
  return (
    <>
    <div className="p-3 bg-white border border-border rounded-lg flex flex-col space-y-4 md:flex-row md:items-center md:space-x-5 md:space-y-0">
      <Skeleton className="h-9 flex-1" />
      <Skeleton className="h-9 w-[120px]" />
      <Skeleton className="h-9 w-[120px]" />
      <Skeleton className="h-9 w-[120px]" />
    </div>
    <div className="overflow-x-auto bg-white p-3 border border-border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tour</TableHead>
            <TableHead className="hidden md:table-cell">Location</TableHead>
            <TableHead className="hidden sm:table-cell">Price</TableHead>
            <TableHead className="hidden lg:table-cell">Author</TableHead>
            <TableHead className="hidden lg:table-cell">Rating</TableHead>
            <TableHead className="hidden md:table-cell">Max People</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loadingRows.map((index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-16 rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[80px] md:hidden" />
                    <Skeleton className="h-3 w-[60px] sm:hidden" />
                    <Skeleton className="h-3 w-[100px] md:hidden" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Skeleton className="h-4 w-[120px]" />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Skeleton className="h-4 w-[60px]" />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Skeleton className="h-4 w-[100px]" />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center">
                  <Skeleton className="h-4 w-[60px]" />
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Skeleton className="h-4 w-[80px]" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-8 w-8 rounded-full ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </>
  );
};

export default TableSkeleton;
