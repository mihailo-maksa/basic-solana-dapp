import React, { useRef, useState } from 'react'
import TooltipContent from './TooltipContent'

interface Props {
  tooltipContent: any
}

const Tooltip: React.FC<Props> = ({
  tooltipContent,
  children, // tooltipTarget
}) => {
  const [show, setShow] = useState(false)
  const [tooltipProperties, setTooltipProperties] = useState({
    top: 0,
    left: 0,
  })

  const targetRef = useRef<HTMLDivElement>(null)

  const handleShowTooltip = () => {
    const tooltipHalfWidth =
      targetRef.current!.getBoundingClientRect().width / 2
    const tooltipHeight = targetRef.current!.getBoundingClientRect().height

    setTooltipProperties({
      top: tooltipHeight,
      left: tooltipHalfWidth,
    })

    setShow(true)
  }

  return (
    <div
      ref={targetRef}
      onMouseEnter={handleShowTooltip}
      onMouseLeave={() => setShow(false)}
      style={{ position: 'relative', paddingBottom: show ? '15px' : '' }}
    >
      <TooltipContent
        show={show}
        top={tooltipProperties.top}
        left={tooltipProperties.left}
      >
        {tooltipContent}
      </TooltipContent>
      <span style={{ cursor: 'pointer' }}>{children}</span>
    </div>
  )
}

export default Tooltip
