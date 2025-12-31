import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Items from "@/pages/items";
import SocialLinks from "@/pages/SocialLinks";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Layout><Dashboard /></Layout>} />
      <Route path="/items" component={() => <Layout><Items /></Layout>} />
      <Route path="/social" component={() => <Layout><SocialLinks /></Layout>} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}
