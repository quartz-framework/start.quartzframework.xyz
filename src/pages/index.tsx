'use client'

import {useEffect, useState} from 'react'
import {Button} from '@/components/Button'
import {Card} from '@/components/Card'
import {
  Compiler, CompilerName,
  Dependency,
  DependencyName,
  JavaVersion,
  Platform,
  PlatformName,
  QuartzVersion,
  SupportedApiVersions
} from '@/globals'
import {CardContent} from "@/components/CardContent";
import {Input} from "@/components/Input";
import {Label} from "@/components/Label";
import {Separator} from "@/components/Separator";
import {Layout} from "@/components/Layout";
import {HeroBackground} from "@/components/HeroBackground";
import Image from "next/image";
import toast from "react-hot-toast";

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
  const [dependenciesModalOpen, setDependenciesModalOpen] = useState(false)
  const [mainClassManuallyEdited, setMainClassManuallyEdited] = useState(false)

  const [form, setForm] = useState({
    groupId: 'com.example',
    artifactId: 'my-plugin',
    name: 'MyPlugin',
    mainClass: 'com.example.myplugin.MyPlugin',
    javaVersion: JavaVersion.JAVA_17,
    platform: Platform.SPIGOT,
    platformApiVersion: SupportedApiVersions[Platform.SPIGOT][0],
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
      const updated = {
        ...prev,
        [name]: value,
      }

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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...form,
        dependencies: Array.from(form.dependencies),
      }),
    });
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${form.artifactId}.zip`
    a.click();
    toast.success("Downloading project...");
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const entries = Object.fromEntries(params.entries());

    if (Object.keys(entries).length > 0) {
      const dependencies = new Set(
          (entries.dependencies || '')
              .split(',')
              .filter(Boolean) as Dependency[]
      );

      const updatedForm = {
        groupId: entries.groupId || form.groupId,
        artifactId: entries.artifactId || form.artifactId,
        name: entries.name || form.name,
        javaVersion: entries.javaVersion as JavaVersion || form.javaVersion,
        platform: entries.platform as Platform || form.platform,
        platformApiVersion: entries.platformApiVersion || form.platformApiVersion,
        version: entries.version as QuartzVersion || form.version,
        compiler: entries.compiler as Compiler || form.compiler,
        dependencies,
        mainClass: form.mainClass,
      }

      if (!mainClassManuallyEdited) {
        updatedForm.mainClass = toMainClass(
            updatedForm.groupId,
            updatedForm.artifactId,
            updatedForm.name
        )
      }

      setForm(updatedForm)
    }
  }, [])

  return (
      <Layout>
        {dependenciesModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Select dependencies</h2>
                <div className="flex flex-wrap gap-2">
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
                                    : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                            }`}
                        >
                          {DependencyName[dep as Dependency]}
                        </button>
                    )
                  })}
                </div>
                <div className="flex justify-between mt-6">
                  <Button
                      variant="secondary"
                      onClick={() => {
                        setForm(prev => ({ ...prev, dependencies: new Set() }))
                      }}
                  >
                    Unselect All
                  </Button>
                  <Button onClick={() => setDependenciesModalOpen(false)}>Done</Button>
                </div>
              </div>
            </div>
        )}
        <main className="mx-auto w-full max-w-xl flex justify-center items-center px-4">
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
                    {Object.values(Compiler).map(v => (
                        <option value={v}>{CompilerName[v]}</option>
                    ))}
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
              <div className="grid grid-cols-2 gap-x-2">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <select
                      name="platform"
                      value={form.platform}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-2 dark:bg-slate-800 dark:border-slate-700 text-sm"
                  >
                    {Object.values(Platform).map(p => (
                        <option key={p} value={p}>{PlatformName[p]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="platformApiVersion">Platform API Version</Label>
                  <select
                      name="platformApiVersion"
                      value={form.platformApiVersion}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-2 dark:bg-slate-800 dark:border-slate-700 text-sm"
                  >
                    {SupportedApiVersions[form.platform].map(version => (
                        <option key={version} value={version}>{version}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between">
                <Button onClick={() => setDependenciesModalOpen(true)}>
                  Dependencies ({form.dependencies.size})
                </Button>
               <div className="flex gap-x-2">
                 <Button onClick={handleSubmit}>Generate Project</Button>
                 <Button
                     variant="secondary"
                     onClick={() => {
                       const url = new URL(window.location.href)
                       for (const [key, value] of Object.entries(form)) {
                         if (key === "dependencies") {
                           url.searchParams.set("dependencies", Array.from(value as Set<string>).join(","))
                         } else {
                           url.searchParams.set(key, value as string)
                         }
                       }
                       navigator.clipboard.writeText(url.toString())
                       toast.success("Link copied to clipboard!")
                     }}
                 >
                   Share
                 </Button>
               </div>
              </div>
            </CardContent>
          </Card>
        </main>
        <div
            className="absolute inset-0 overflow-hidden pointer-events-none -z-10"
            aria-hidden="true"
        >
          <div className="absolute inset-x-0 -top-32 -bottom-48 mask-[linear-gradient(transparent,white,white)] dark:mask-[linear-gradient(transparent,white,transparent)] lg:mask-none lg:dark:mask-[linear-gradient(white,white,transparent)]">
            <HeroBackground className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-0 lg:translate-x-0 lg:translate-y-[-60%]" />
          </div>
          <Image
              className="absolute -top-64 -right-64"
              src={'blur-cyan.png'}
              alt=""
              width={530}
              height={530}
              unoptimized
              priority
          />
          <Image
              className="absolute -right-44 -bottom-40"
              src={'blur-indigo.png'}
              alt=""
              width={567}
              height={567}
              unoptimized
              priority
          />
        </div>
      </Layout>
  )
}