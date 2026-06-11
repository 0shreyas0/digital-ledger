import { Pressable } from 'react-native'
import React from 'react'

/**
 * AppPressable - a thin wrapper around RN Pressable that applies
 * `active:bg-accent` by default so every interactive element in the
 * app gets a consistent pressed-state highlight.
 *
 * Pass `activeClassName` to override the default active style,
 * or set it to "" to opt out entirely.
 */
const AppPressable = ({
  className = "",
  activeClassName = "active:bg-accent active:text-black",
  children,
  ...props
}) => {
  return (
    <Pressable
      {...props}
      className={`group ${activeClassName} ${className}`}
    >
      {children}
    </Pressable>
  )
}

export default AppPressable
