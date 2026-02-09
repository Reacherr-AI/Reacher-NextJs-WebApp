"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function AlertDialog(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Root>
) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>
) {
  return (
    <AlertDialogPrimitive.Trigger
      data-slot="alert-dialog-trigger"
      {...props}
    />
  )
}

function AlertDialogPortal(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>
) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-black/90 text-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 w-[calc(100%-2rem)] max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-white/10 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.7)] outline-none backdrop-blur-xl",
          className
        )}
        {...props}
      >
        {children}
        <AlertDialogPrimitive.Cancel
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-sm" }),
            "absolute right-3 top-3 border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
          )}
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </AlertDialogPrimitive.Cancel>
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  )
}

function AlertDialogHeader(props: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className="flex flex-col gap-1.5"
      {...props}
    />
  )
}

function AlertDialogFooter(props: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
      {...props}
    />
  )
}

function AlertDialogTitle(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Title>
) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className="text-lg font-semibold"
      {...props}
    />
  )
}

function AlertDialogDescription(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Description>
) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className="text-sm text-white/60"
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      className={cn(
        buttonVariants({ variant: "destructive" }),
        "rounded-xl",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      className={cn(
        buttonVariants({ variant: "outline" }),
        "rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10",
        className
      )}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}

