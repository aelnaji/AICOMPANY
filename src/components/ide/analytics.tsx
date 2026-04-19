"use client";

import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const data = [
  { name: "Mon", tasks: 12, tokens: 4500, cost: 0.24 },
  { name: "Tue", tasks: 19, tokens: 8200, cost: 0.45 },
  { name: "Wed", tasks: 15, tokens: 6100, cost: 0.32 },
  { name: "Thu", tasks: 22, tokens: 9800, cost: 0.54 },
  { name: "Fri", tasks: 30, tokens: 14500, cost: 0.82 },
  { name: "Sat", tasks: 8, tokens: 3200, cost: 0.18 },
  { name: "Sun", tasks: 5, tokens: 2100, cost: 0.12 },
];

const COLORS = ["#00c9a7", "#8b5cf6", "#f59e0b", "#ef4444"];

export function Analytics() {
  return (
    <div className="h-full w-full bg-[#0d0f12] p-6 overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-[#161b22] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Total Tasks Executed</CardTitle>
            <CardDescription className="text-2xl font-bold text-white tracking-tighter">111</CardDescription>
          </CardHeader>
          <CardContent className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <Bar dataKey="tasks" fill="#00c9a7" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Token Usage (K)</CardTitle>
            <CardDescription className="text-2xl font-bold text-white tracking-tighter">48.4k</CardDescription>
          </CardHeader>
          <CardContent className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <Area type="monotone" dataKey="tokens" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Estimated Cost ($)</CardTitle>
            <CardDescription className="text-2xl font-bold text-white tracking-tighter">$2.67</CardDescription>
          </CardHeader>
          <CardContent className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#161b22] border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white">Daily Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#484f58" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#484f58" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0d0f12", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  itemStyle={{ color: "#00c9a7" }}
                />
                <Bar dataKey="tasks" fill="#00c9a7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white">Agent Task Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "CEO", value: 400 },
                    { name: "CTO", value: 300 },
                    { name: "Backend", value: 300 },
                    { name: "Frontend", value: 200 },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0d0f12", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">1,200</span>
              <span className="text-[10px] text-muted-foreground uppercase">Tasks</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
