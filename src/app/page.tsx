import { SearchForm } from '@/components/search-form';
import { Leaf } from 'lucide-react';

export default function Home() {
  return (
    <section className="container flex flex-col items-center justify-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-center gap-2 text-center">
        <Leaf className="h-16 w-16 text-primary" />
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-6xl font-headline">
          GreenPass Verification
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Verify your participation and role in events organized by the Green
          Environmental Society.
        </p>
      </div>
      <div className="w-full max-w-md space-y-4">
        <SearchForm />
      </div>
    </section>
  );
}
