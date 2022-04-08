import React from 'react'

interface Props {
  show: boolean
  children: any
  top: number
  left: number
}

const TooltipContent: React.FC<Props> = ({ show, children, top, left }) => {
  return (
    <div
      style={{
        top,
        left,
        position: 'absolute',
        display: show ? 'inline' : 'none',
      }}
    >
      {children}
    </div>
  )
}

export default TooltipContent
