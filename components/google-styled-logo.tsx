interface GoogleStyledLogoProps {
    width?: number
    height?: number
    className?: string
  }
  
  export default function GoogleStyledLogo({ width = 150, height = 150, className = "" }: GoogleStyledLogoProps) {
    // Google colors
    const googleBlue = "#4285F4"
    const googleRed = "#EA4335"
    const googleYellow = "#FBBC05"
  
    return (
      <svg width={width} height={height} viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg" className={className}>
        <g>
          <path fill="none" d="M0,0H150V150H0V0Z" />
        </g>
        <g>
          {/* Middle swirl - Blue */}
          <path
            fill={googleBlue}
            d="M101.67,115.03c13.78-.58,21.39-8.06,21.39-18.99s-8.12-19.6-19.7-25.32l-39.87-19.63c-7.68-3.82-11.91-8.39-12.79-13.94-13.78,.58-21.39,8.06-21.39,18.99s8.12,19.6,19.7,25.32l39.87,19.63c7.68,3.82,11.91,8.39,12.79,13.94Z"
          />
          {/* Top curve - Red */}
          <path
            fill={googleRed}
            d="M37.5,34.31c10.02-14.05,21.32-25.25,39.6-25.25,14.32,0,33.24,4.91,47.42,16.99l-19.46,25.11c-16.01-15.16-49.72-24.84-67.56-16.86Z"
          />
          {/* Bottom curve - Yellow */}
          <path
            fill={googleYellow}
            d="M114.9,117.87c-10.05,14.05-21.32,25.25-39.6,25.25-14.32,0-33.24-4.91-47.42-16.99l19.46-25.11c16.01,15.2,49.72,24.84,67.56,16.86Z"
          />
        </g>
      </svg>
    )
  }
  
  