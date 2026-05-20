"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { authClient } from "@/lib/auth-client"
import { cn, getInitials } from "@/lib/utils"
import { toast } from "sonner"
import { 
  Settings, Shield, Palette, Mail, User, Loader2, Bell, Lock, 
  Key, Monitor, Moon, Sun, Globe, Clock, Eye, EyeOff, 
  Save, Trash2, LogOut, Smartphone, Database
} from "lucide-react"

interface UserData {
  id: string
  name: string
  email: string
  image?: string
  role: string
  createdAt: string
}

interface SettingsSection {
  id: string
  label: string
  icon: any
  description: string
}

const settingsSections: SettingsSection[] = [
  { id: "profile", label: "Profile", icon: User, description: "Manage your personal information" },
  { id: "security", label: "Security", icon: Shield, description: "Password and authentication settings" },
  { id: "notifications", label: "Notifications", icon: Bell, description: "Configure notification preferences" },
  { id: "appearance", label: "Appearance", icon: Palette, description: "Customize the interface look" },
  { id: "account", label: "Account", icon: Key, description: "Account actions and danger zone" },
]

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("profile")
  
  // Profile state
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [profileSaving, setProfileSaving] = useState(false)
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Notification state
  const [emailNotif, setEmailNotif] = useState(true)
  const [taskNotif, setTaskNotif] = useState(true)
  const [projectNotif, setProjectNotif] = useState(true)
  const [evalNotif, setEvalNotif] = useState(true)
  
  // Appearance state
  const [theme, setTheme] = useState("light")
  const [accentColor, setAccentColor] = useState("indigo")
  const [fontSize, setFontSize] = useState("medium")
  const [compactMode, setCompactMode] = useState(false)

  useEffect(() => {
    authClient.getSession().then((res: any) => {
      if (res.data?.user) {
        const u = res.data.user
        setUser({
          id: u.id,
          name: u.name,
          email: u.email,
          image: u.image || undefined,
          role: u.role || "reviewer",
          createdAt: u.createdAt || new Date().toISOString(),
        })
        setEditName(u.name)
        setEditEmail(u.email)
      }
      setLoading(false)
    })
  }, [])

  const handleUpdateProfile = async () => {
    setProfileSaving(true)
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, email: editEmail }),
      })
      if (!res.ok) throw new Error()
      
      setUser(prev => prev ? { ...prev, name: editName, email: editEmail } : null)
      toast.success("Profile updated successfully")
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setProfileSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match")
      return
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    
    setPasswordSaving(true)
    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (!res.ok) throw new Error()
      
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Password updated successfully")
    } catch {
      toast.error("Failed to update password")
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved")
  }

  const handleSaveAppearance = () => {
    toast.success("Appearance settings saved")
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return
    try {
      const res = await fetch("/api/settings/account", { method: "DELETE" })
      if (!res.ok) throw new Error()
      await authClient.signOut()
      window.location.href = "/"
    } catch {
      toast.error("Failed to delete account")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3 mb-1">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="h-7 w-32" />
        </div>
        <Skeleton className="h-4 w-56 mb-6" />
        <div className="grid gap-6 max-w-4xl">
          <Card><CardContent className="p-6 space-y-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-10 w-full" />
          </CardContent></Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4">
          <Loader2 className="w-7 h-7 text-rose-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Could not load settings</h2>
        <p className="text-sm text-slate-500">Please try refreshing the page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-200">
          <Settings className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 display">Settings</h1>
      </div>
      <p className="text-sm text-slate-500 font-mono">
        Manage your account and workspace preferences
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="space-y-2">
          {settingsSections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                activeSection === section.id 
                  ? "bg-indigo-50 border border-indigo-200" 
                  : "hover:bg-slate-50 border border-transparent"
              )}
            >
              <section.icon className={cn("w-5 h-5", activeSection === section.id ? "text-indigo-600" : "text-slate-400")} />
              <div>
                <p className={cn("text-sm font-medium", activeSection === section.id ? "text-indigo-900" : "text-slate-700")}>
                  {section.label}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Section */}
          {activeSection === "profile" && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Profile Information</h2>
                    <p className="text-[10px] font-mono text-slate-400">Update your personal details</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <Badge variant={user.role === "admin" ? "indigo" : "blue"} className="mt-2">
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Full Name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <Input 
                    label="Email Address"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    Account created {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <Button onClick={handleUpdateProfile} disabled={profileSaving}>
                    {profileSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Security Settings</h2>
                    <p className="text-[10px] font-mono text-slate-400">Manage your password and security options</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Lock className="w-5 h-5 text-slate-600" />
                    <h3 className="font-medium text-slate-900">Change Password</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <Input 
                        label="Current Password"
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Input 
                      label="New Password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                    />
                    <Input 
                      label="Confirm New Password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button onClick={handleUpdatePassword} disabled={passwordSaving}>
                      {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Key className="w-4 h-4 mr-1" />}
                      Update Password
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Smartphone className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-medium text-indigo-900">Two-Factor Authentication</h3>
                  </div>
                  <p className="text-sm text-indigo-700 mb-3">
                    Add an extra layer of security to your account.
                  </p>
                  <Button variant="secondary" size="sm">
                    Enable 2FA
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Database className="w-5 h-5 text-slate-600" />
                    <h3 className="font-medium text-slate-900">Active Sessions</h3>
                  </div>
                  <p className="text-sm text-slate-500">
                    View and manage your active login sessions.
                  </p>
                  <Button variant="secondary" size="sm" className="mt-3">
                    Manage Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Notification Preferences</h2>
                    <p className="text-[10px] font-mono text-slate-400">Choose what you want to be notified about</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Email Notifications", desc: "Receive updates via email", state: emailNotif, setState: setEmailNotif },
                  { label: "Task Assignments", desc: "When a task is assigned to you", state: taskNotif, setState: setTaskNotif },
                  { label: "Project Updates", desc: "Changes to projects you're member of", state: projectNotif, setState: setProjectNotif },
                  { label: "Evaluation Results", desc: "When evaluations are completed", state: evalNotif, setState: setEvalNotif },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => item.setState(!item.state)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        item.state ? "bg-indigo-500" : "bg-slate-300"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow",
                        item.state ? "left-6" : "left-0.5"
                      )} />
                    </button>
                  </div>
                ))}
                <Button onClick={handleSaveNotifications} className="mt-4">
                  <Save className="w-4 h-4 mr-1" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Appearance Section */}
          {activeSection === "appearance" && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Appearance Settings</h2>
                    <p className="text-[10px] font-mono text-slate-400">Customize how the interface looks</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
                    Theme
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setTheme("light")}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all flex items-center gap-3",
                        theme === "light" ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <Sun className="w-5 h-5 text-amber-500" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-900">Light</p>
                        <p className="text-xs text-slate-500">Bright and clean</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all flex items-center gap-3",
                        theme === "dark" ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <Moon className="w-5 h-5 text-indigo-500" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-900">Dark</p>
                        <p className="text-xs text-slate-500">Easy on the eyes</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
                    Accent Color
                  </label>
                  <div className="flex gap-3">
                    {["indigo", "blue", "violet", "emerald", "rose"].map(color => (
                      <button
                        key={color}
                        onClick={() => setAccentColor(color)}
                        className={cn(
                          "w-10 h-10 rounded-full transition-all",
                          accentColor === color ? "ring-2 ring-offset-2 ring-indigo-500 scale-110" : ""
                        )}
                        style={{ backgroundColor: `var(--${color}-500)` }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
                    Font Size
                  </label>
                  <Select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    options={[
                      { value: "small", label: "Small" },
                      { value: "medium", label: "Medium (Default)" },
                      { value: "large", label: "Large" },
                    ]}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Compact Mode</p>
                    <p className="text-xs text-slate-500">Reduce spacing for more content</p>
                  </div>
                  <button
                    onClick={() => setCompactMode(!compactMode)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      compactMode ? "bg-indigo-500" : "bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow",
                      compactMode ? "left-6" : "left-0.5"
                    )} />
                  </button>
                </div>

                <Button onClick={handleSaveAppearance}>
                  <Save className="w-4 h-4 mr-1" />
                  Apply Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Account Section */}
          {activeSection === "account" && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                    <Key className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Account Actions</h2>
                    <p className="text-[10px] font-mono text-slate-400">Manage your account and data</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <LogOut className="w-5 h-5 text-slate-600" />
                    <h3 className="font-medium text-slate-900">Sign Out</h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">
                    Sign out of your account on this device.
                  </p>
                  <Button variant="secondary" onClick={() => authClient.signOut()}>
                    Sign Out
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Trash2 className="w-5 h-5 text-rose-600" />
                    <h3 className="font-medium text-rose-900">Delete Account</h3>
                  </div>
                  <p className="text-sm text-rose-700 mb-3">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="danger" onClick={handleDeleteAccount}>
                    Delete My Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-slate-200 rounded-xl", className)} />
}