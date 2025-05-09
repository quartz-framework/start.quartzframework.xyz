'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Dependency, JavaVersion, Platform, PlatformName, Compiler, QuartzVersion } from '@/globals'
import { CardContent } from "@/components/CardContent";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { Separator } from "@/components/Separator";
import { Layout } from "@/components/Layout";

function toMainClass(groupId: string, artifactId: string, name: string): string {
  const sanitizedArtifact = artifactId.replace(/[^a-zA-Z0-9]/g, '')
  const sanitizedName = name
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('')
  return `${groupId}.${sanitizedArtifact}.${sanitizedName}`
}

export default function Home() {
  const [mainClassManuallyEdited, setMainClassManuallyEdited] = useState(false)

  const [form, setForm] = useState({
    groupId: 'com.example',
    artifactId: 'my-plugin',
    name: 'MyPlugin',
    mainClass: 'com.example.myplugin.MyPlugin',
    javaVersion: JavaVersion.JAVA_17,
    platform: Platform.SPIGOT,
    version: QuartzVersion["0.0.1-SNAPSHOT"],
    dependencies: new Set<Dependency>(),
    compiler: Compiler.MAVEN,
  })

  const updateMainClass = (next: any) => {
    if (!mainClassManuallyEdited) {
      next.mainClass = toMainClass(next.groupId, next.artifactId, next.name)
    }
    return next
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    setForm(prev => {
      const updated = { ...prev, [name]: value }
      return updateMainClass(updated)
    })
  }

  const handleMainClassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMainClassManuallyEdited(true)
    setForm(prev => ({ ...prev, mainClass: e.target.value }))
  }

  const toggleDependency = (dep: Dependency) => {
    setForm(prev => {
      const newDeps = new Set(prev.dependencies)
      newDeps.has(dep) ? newDeps.delete(dep) : newDeps.add(dep)
      return { ...prev, dependencies: newDeps }
    })
  }

  const handleSubmit = async () => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        dependencies: Array.from(form.dependencies),
      }),
    })
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${form.artifactId}.zip`
    a.click()
  }

  return (
      <Layout>
        <main className="mx-auto w-full max-w-3xl px-4">
          <Card>
            <CardContent>
              <div>
                <Label htmlFor="name">Plugin Name</Label>
                <Input name="name" value={form.name} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-x-2">
                <div>
                  <Label htmlFor="groupId">Group ID</Label>
                  <Input name="groupId" value={form.groupId} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="artifactId">Artifact ID</Label>
                  <Input name="artifactId" value={form.artifactId} onChange={handleChange} />
                </div>
              </div>
              <div>
                <Label htmlFor="mainClass">Main Class</Label>
                <Input name="mainClass" value={form.mainClass} onChange={handleMainClassChange} />
              </div>
              <div className="grid grid-cols-3 gap-x-2">
                <div>
                  <Label htmlFor="javaVersion">Java Version</Label>
                  <select
                      name="javaVersion"
                      value={form.javaVersion}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-2 dark:bg-slate-800 dark:border-slate-700 text-sm"
                  >
                    {Object.values(JavaVersion).map(version => (
                        <option key={version} value={version}>{version}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="compiler">Build Tool</Label>
                  <select
                      name="compiler"
                      value={form.compiler}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-2 dark:bg-slate-800 dark:border-slate-700 text-sm"
                  >
                    <option value={Compiler.MAVEN}>Maven</option>
                    <option value={Compiler.GRADLE}>Gradle</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="version">Quartz Version</Label>
                  <select
                      name="version"
                      value={form.version}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-2 dark:bg-slate-800 dark:border-slate-700 text-sm"
                  >
                    {Object.values(QuartzVersion).map(v => (
                        <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="platform">Platform</Label>
                <select
                    name="platform"
                    value={form.platform}
                    onChange={handleChange}
                    className="w-full rounded border px-3 py-2 dark:bg-slate-800 dark:border-slate-700 text-sm"
                >
                  {Object.values(Platform).map(p => (
                      <option key={p} value={p}>
                        {PlatformName[p]}
                      </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Dependencies</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.values(Dependency).map(dep => {
                    const selected = form.dependencies.has(dep)
                    return (
                        <button
                            type="button"
                            key={dep}
                            onClick={() => toggleDependency(dep)}
                            className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
                                selected
                                    ? 'bg-sky-600 text-white border-sky-600'
                                    : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                            }`}
                        >
                          {dep}
                        </button>
                    )
                  })}
                </div>
              </div>

              <Separator />
              <Button onClick={handleSubmit}>Generate Project</Button>
            </CardContent>
          </Card>
        </main>
      </Layout>
  )
}