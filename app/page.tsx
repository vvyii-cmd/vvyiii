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
          <h1 className="text-3xl font-semibold tracking-tight">vvyiii</h1>
          <p className="text-muted-foreground mt-1">
            Next.js + Tailwind + shadcn/ui 原型脚手架,可以开始搭产品概念了。
          </p>
        </div>
        <Badge variant="secondary">prototype</Badge>
      </div>

      <Separator className="my-8" />

      <Tabs defaultValue="form" className="w-full">
        <TabsList>
          <TabsTrigger value="form">表单示例</TabsTrigger>
          <TabsTrigger value="components">组件预览</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>新建概念</CardTitle>
              <CardDescription>
                一个用 shadcn/ui 组件搭的示例表单,直接改这里开始做原型。
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">名称</Label>
                <Input id="name" placeholder="给你的概念起个名字" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  placeholder="这个产品概念解决什么问题?"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="public" />
                <Label htmlFor="public">对团队可见</Label>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button>创建</Button>
              <Button variant="outline">取消</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>已安装的组件</CardTitle>
              <CardDescription>
                components/ui/ 下还有 dialog、dropdown-menu、select、tooltip
                等,用 npx shadcn add 可以继续加。
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
                <AvatarFallback>YW</AvatarFallback>
              </Avatar>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
