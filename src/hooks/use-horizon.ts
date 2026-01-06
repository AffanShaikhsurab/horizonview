'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession, useUser } from '@clerk/nextjs'
import { useMemo, useState, useEffect } from 'react'
import { createClient, createAuthenticatedClient } from '@/lib/supabase/client'
import type {
  Mission,
  MissionInsert,
  MissionUpdate,
  Project,
  ProjectInsert,
  ProjectUpdate,
  MissionWithProjects
} from '@/types/database'

// ============== Supabase Client with Clerk Token ==============
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useSupabase(): any {
  const { session } = useSession()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      session.getToken().then(setToken)
    }
  }, [session])

  return useMemo(() => {
    if (token) {
      // Using any because Supabase SDK loses type generics when using global.headers config
      return createAuthenticatedClient(token)
    }
    return createClient()
  }, [token])
}

// ============== Query Keys ==============
export const queryKeys = {
  missions: ['missions'] as const,
  missionById: (id: string) => ['missions', id] as const,
  projects: ['projects'] as const,
  projectById: (id: string) => ['projects', id] as const,
  projectsByMission: (missionId: string) => ['projects', 'mission', missionId] as const,
  missionsWithProjects: ['missions', 'with-projects'] as const,
}

// ============== Query Hooks ==============
export function useMissions() {
  const supabase = useSupabase()
  const { isSignedIn } = useUser()

  return useQuery({
    queryKey: queryKeys.missions,
    queryFn: async (): Promise<Mission[]> => {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      return data ?? []
    },
    enabled: isSignedIn,
  })
}

export function useMissionsWithProjects() {
  const supabase = useSupabase()
  const { isSignedIn } = useUser()

  return useQuery({
    queryKey: queryKeys.missionsWithProjects,
    queryFn: async (): Promise<MissionWithProjects[]> => {
      const { data, error } = await supabase
        .from('missions')
        .select(`
          *,
          projects (*)
        `)
        .order('order_index', { ascending: true })

      if (error) throw error
      return (data ?? []) as MissionWithProjects[]
    },
    enabled: isSignedIn,
  })
}

export function useProjects() {
  const supabase = useSupabase()
  const { isSignedIn } = useUser()

  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    enabled: isSignedIn,
  })
}

export function useProjectsByMission(missionId: string) {
  const supabase = useSupabase()
  const { isSignedIn } = useUser()

  return useQuery({
    queryKey: queryKeys.projectsByMission(missionId),
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    enabled: !!missionId && isSignedIn,
  })
}

// ============== Mutation Hooks ==============

// Mission Mutations
export function useCreateMission() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { user } = useUser()

  return useMutation({
    mutationFn: async (mission: MissionInsert): Promise<Mission> => {
      const insertData = {
        ...mission,
        user_id: user?.id,
      }

      const { data, error } = await supabase
        .from('missions')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(insertData as any)
        .select()
        .single()

      if (error) throw error
      return data as Mission
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missions })
      queryClient.invalidateQueries({ queryKey: queryKeys.missionsWithProjects })
    },
  })
}

export function useUpdateMission() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: MissionUpdate & { id: string }): Promise<Mission> => {
      const { data, error } = await supabase
        .from('missions')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(updates as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Mission
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missions })
      queryClient.invalidateQueries({ queryKey: queryKeys.missionsWithProjects })
    },
  })
}

export function useDeleteMission() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missions })
      queryClient.invalidateQueries({ queryKey: queryKeys.missionsWithProjects })
    },
  })
}

// Project Mutations
export function useCreateProject() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { user } = useUser()

  return useMutation({
    mutationFn: async (project: ProjectInsert): Promise<Project> => {
      const insertData = {
        ...project,
        user_id: user?.id,
      }

      const { data, error } = await supabase
        .from('projects')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(insertData as any)
        .select()
        .single()

      if (error) throw error
      return data as Project
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      queryClient.invalidateQueries({ queryKey: queryKeys.missionsWithProjects })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectsByMission(data.mission_id) })
    },
  })
}

export function useUpdateProject() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: ProjectUpdate & { id: string }): Promise<Project> => {
      const { data, error } = await supabase
        .from('projects')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(updates as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Project
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      queryClient.invalidateQueries({ queryKey: queryKeys.missionsWithProjects })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectsByMission(data.mission_id) })
    },
  })
}

export function useDeleteProject() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string; missionId: string }): Promise<void> => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      queryClient.invalidateQueries({ queryKey: queryKeys.missionsWithProjects })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectsByMission(variables.missionId) })
    },
  })
}

// Archive project (change status to Archived)
export function useArchiveProject() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string; missionId: string }): Promise<Project> => {
      const { data, error } = await supabase
        .from('projects')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ status: 'Archived' } as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Project
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      queryClient.invalidateQueries({ queryKey: queryKeys.missionsWithProjects })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectsByMission(variables.missionId) })
    },
  })
}

// ============== Energy/Focus Calculator ==============
export function calculateFocusBudget(projects: Project[]): number {
  const activeProjects = projects.filter(p => p.status === 'Active')
  const currentLoad = activeProjects.length * 20 // 20% per project
  const remainingEnergy = Math.max(5, 100 - currentLoad) // Minimum 5%
  return remainingEnergy
}

export function getEnergyColor(energy: number): string {
  if (energy < 30) return '#ef4444' // Red
  if (energy < 60) return '#f59e0b' // Orange
  return '#ffffff' // White
}
