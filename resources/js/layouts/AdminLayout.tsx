import * as React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useState } from 'react'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '../components/ui/sidebar.js'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu.js'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar.js'
import { Button } from '../components/ui/button.js'
import {
  LayoutDashboardIcon,
  UsersIcon,
  ImageIcon,
  CalendarIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronDown,
} from 'lucide-react'

const adminNavItems = [
  { title: 'Dashboard', icon: LayoutDashboardIcon, url: '/admin' },
  { title: 'Guests', icon: UsersIcon, url: '/admin/guests' },
  { title: 'Gallery', icon: ImageIcon, url: '/admin/gallery' },
  { title: 'Stories', icon: CalendarIcon, url: '/admin/stories' },
  { title: 'Settings', icon: SettingsIcon, url: '/admin/settings' },
]

export function AdminLayout() {
  const [user] = useState({ name: 'Admin', email: 'admin@example.com', avatar: '' })
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    // Sign out logic will be handled by AuthContext once created
    console.log('Sign out')
    setLoading(false)
  }

  const userInitials = user.email ? user.email.slice(0, 2).toUpperCase() : 'AD'

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                <a href="/admin">
                  <span className="text-base font-semibold">Admin Panel</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild>
                  <NavLink to={item.url}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end" sideOffset={4}>
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <NavLink to="/admin/settings">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Settings
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} disabled={loading}>
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger />
          <div className="flex-1" />
          <Button variant="ghost" size="icon" asChild>
            <a href="/" target="_blank">
              <span className="text-xs">View Site</span>
            </a>
          </Button>
        </header>

        <main className="flex flex-1 flex-col p-4">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}