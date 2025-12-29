import { useState } from "react";
import { useItems, useDeleteItem } from "@/hooks/use-items";
import { ItemDialog } from "@/components/item-dialog";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import { 
  Search, ExternalLink, Trash2, 
  MoreVertical, RefreshCw 
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ItemsPage() {
  const { data: items, isLoading } = useItems();
  const deleteItem = useDeleteItem();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredItems = items?.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.sourceUrl.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteId) {
      deleteItem.mutate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Harvested Items</h2>
          <p className="text-muted-foreground mt-1">Manage your data sources and check harvest status.</p>
        </div>
        <ItemDialog />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-white/5">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search items..." 
            className="pl-9 bg-background/50 border-white/10 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="icon" className="shrink-0" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-white/5 bg-card overflow-hidden shadow-lg">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[300px]">Title</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[180px]">Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading items...
                </TableCell>
              </TableRow>
            ) : filteredItems?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No items found. Try adding one!
                </TableCell>
              </TableRow>
            ) : (
              filteredItems?.map((item) => (
                <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell className="font-medium">
                    {item.title}
                    {item.content && (
                       <p className="text-xs text-muted-foreground truncate max-w-[200px] mt-1">{item.content}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <a 
                      href={item.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline font-mono"
                    >
                      {new URL(item.sourceUrl).hostname}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {format(new Date(item.createdAt), 'MMM d, HH:mm')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-white/10">
                        <DropdownMenuItem 
                          className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
                          onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the harvested item and its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 hover:bg-white/5">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
