'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const FormSchema = z.object({
  id: z.string().min(1, {
    message: 'Verification ID is required.',
  }),
});

export function SearchForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    router.push(`/verify/${data.id}`);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-center">Enter Your Verification ID</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Verification ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., GES001"
                      {...field}
                      className="text-center text-lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" size="lg">
              <Search className="mr-2 h-4 w-4" /> Verify
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
