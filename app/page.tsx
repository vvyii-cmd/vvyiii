import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Otter Verify</h1>
          <p className="text-muted-foreground mt-1">
            Next.js + Tailwind + shadcn/ui prototype starter, ready to build on.
          </p>
        </div>
        <Badge variant="secondary">prototype</Badge>
      </div>

      <Separator className="my-8" />

      <Tabs defaultValue="form" className="w-full">
        <TabsList>
          <TabsTrigger value="form">Form example</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>New concept</CardTitle>
              <CardDescription>
                A sample form built with shadcn/ui components — edit this page
                to start prototyping.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Give your concept a name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What problem does this concept solve?"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="public" />
                <Label htmlFor="public">Visible to team</Label>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button>Create</Button>
              <Button variant="outline">Cancel</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Installed components</CardTitle>
              <CardDescription>
                More live in components/ui/ (dialog, dropdown-menu, select,
                tooltip, …) — add others with npx shadcn add.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Button size="sm">Button</Button>
              <Button size="sm" variant="secondary">
                Secondary
              </Button>
              <Button size="sm" variant="destructive">
                Destructive
              </Button>
              <Badge>Badge</Badge>
              <Badge variant="outline">Outline</Badge>
              <Avatar>
                <AvatarFallback>VW</AvatarFallback>
              </Avatar>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
