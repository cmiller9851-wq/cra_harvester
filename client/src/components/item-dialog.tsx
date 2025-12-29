import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Link as LinkIcon, Type } from "lucide-react";

import { useCreateItem } from "@/hooks/use-items";
import { insertHarvestedItemSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Extend schema to make status optional in form (defaults to pending on backend)
const formSchema = insertHarvestedItemSchema.extend({
  status: z.enum(["pending", "completed", "failed"]).default("pending"),
});

export function ItemDialog() {
  const [open, setOpen] = useState(false);
  const createItem = useCreateItem();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      sourceUrl: "",
      content: "",
      status: "pending",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createItem.mutate(values, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" />
          Add Source
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-white/10">
        <DialogHeader>
          <DialogTitle>New Harvest Source</DialogTitle>
          <DialogDescription>
            Add a new URL to the harvesting queue.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Type className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Market Analysis Q3" className="pl-9 bg-background/50 border-white/10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sourceUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source URL</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="https://example.com/data" className="pl-9 bg-background/50 border-white/10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any context notes here..." 
                      className="resize-none bg-background/50 border-white/10 min-h-[100px]" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createItem.isPending} className="w-full">
                {createItem.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {createItem.isPending ? "Adding to Queue..." : "Add to Queue"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
