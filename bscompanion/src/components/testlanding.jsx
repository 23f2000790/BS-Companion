import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform, useMotionValue, animate } from 'framer-motion'
import { VariantProps, cva } from 'class-variance-authority'
import useMeasure from 'react-use-measure'
import { 
  Menu, 
  X, 
  ArrowRight, 
  ChevronRight, 
  Mail, 
  MapPin, 
  Phone, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Github, 
  ArrowUpRight, 
  Sparkles, 
  Zap, 
  Palette, 
  Code, 
  LineChart, 
  MessageSquare,
  Users,
  BookOpen,
  Trophy,
  Target,
  Brain,
  MessageCircle,
  Star,
  Play,
  Download,
  Send
} from 'lucide-react'

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Button Component
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

// Animated Group Component
type PresetType = 'fade' | 'slide' | 'scale' | 'blur' | 'blur-slide' | 'zoom' | 'flip' | 'bounce' | 'rotate' | 'swing'

type AnimatedGroupProps = {
  children: React.ReactNode
  className?: string
  variants?: {
    container?: any
    item?: any
  }
  preset?: PresetType
}

const defaultContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const defaultItemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const presetVariants: Record<PresetType, { container: any; item: any }> = {
  fade: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
  },
  slide: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
  },
  scale: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
  },
  blur: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: 'blur(4px)' },
      visible: { opacity: 1, filter: 'blur(0px)' },
    },
  },
  'blur-slide': {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: 'blur(4px)', y: 20 },
      visible: { opacity: 1, filter: 'blur(0px)', y: 0 },
    },
  },
  zoom: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, scale: 0.5 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      },
    },
  },
  flip: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, rotateX: -90 },
      visible: {
        opacity: 1,
        rotateX: 0,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      },
    },
  },
  bounce: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: -50 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 400, damping: 10 },
      },
    },
  },
  rotate: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, rotate: -180 },
      visible: {
        opacity: 1,
        rotate: 0,
        transition: { type: 'spring', stiffness: 200, damping: 15 },
      },
    },
  },
  swing: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, rotate: -10 },
      visible: {
        opacity: 1,
        rotate: 0,
        transition: { type: 'spring', stiffness: 300, damping: 8 },
      },
    },
  },
}

function AnimatedGroup({ children, className, variants, preset }: AnimatedGroupProps) {
  const selectedVariants = preset
    ? presetVariants[preset]
    : { container: defaultContainerVariants, item: defaultItemVariants }
  const containerVariants = variants?.container || selectedVariants.container
  const itemVariants = variants?.item || selectedVariants.item

  return (
    <motion.div
      initial='hidden'
      animate='visible'
      variants={containerVariants}
      className={cn(className)}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Infinite Slider Component
type InfiniteSliderProps = {
  children: React.ReactNode
  gap?: number
  duration?: number
  durationOnHover?: number
  direction?: 'horizontal' | 'vertical'
  reverse?: boolean
  className?: string
}

function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentDuration, setCurrentDuration] = useState(duration)
  const [ref, { width, height }] = useMeasure()
  const translation = useMotionValue(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [key, setKey] = useState(0)

  useEffect(() => {
    let controls
    const size = direction === 'horizontal' ? width : height
    const contentSize = size + gap
    const from = reverse ? -contentSize / 2 : 0
    const to = reverse ? 0 : -contentSize / 2

    if (isTransitioning) {
      controls = animate(translation, [translation.get(), to], {
        ease: 'linear',
        duration: currentDuration * Math.abs((translation.get() - to) / contentSize),
        onComplete: () => {
          setIsTransitioning(false)
          setKey((prevKey) => prevKey + 1)
        },
      })
    } else {
      controls = animate(translation, [from, to], {
        ease: 'linear',
        duration: currentDuration,
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay: 0,
        onRepeat: () => {
          translation.set(from)
        },
      })
    }

    return controls?.stop
  }, [key, translation, currentDuration, width, height, gap, isTransitioning, direction, reverse])

  const hoverProps = durationOnHover
    ? {
        onHoverStart: () => {
          setIsTransitioning(true)
          setCurrentDuration(durationOnHover)
        },
        onHoverEnd: () => {
          setIsTransitioning(true)
          setCurrentDuration(duration)
        },
      }
    : {}

  return (
    <div className={cn('overflow-hidden', className)}>
      <motion.div
        className='flex w-max'
        style={{
          ...(direction === 'horizontal' ? { x: translation } : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
        }}
        ref={ref}
        {...hoverProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  )
}

// Pulse Button Component
interface PulseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "ghost"
  size?: "sm" | "md" | "lg"
  glowEffect?: "none" | "subtle" | "intense"
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  animationType?: "ripple" | "pulse" | "glitch" | "magnetic" | "none"
  className?: string
}

const PulseButton = ({
  children,
  variant = "primary",
  size = "md",
  glowEffect = "subtle",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  iconPosition = "left",
  animationType = "ripple",
  className = "",
  ...props
}: PulseButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [rippleEffect, setRippleEffect] = useState<Array<{
    x: number,
    y: number,
    size: number,
    id: number
  }>>([])
  const [rippleCount, setRippleCount] = useState(0)
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animationType !== 'magnetic' || disabled || loading) return
    
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const distanceX = x - centerX
    const distanceY = y - centerY
    
    setButtonPosition({
      x: distanceX / 10,
      y: distanceY / 10
    })
  }
  
  const resetMagneticEffect = () => {
    if (animationType !== 'magnetic') return
    setButtonPosition({ x: 0, y: 0 })
  }
  
  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animationType !== 'ripple' || disabled || loading) return
    
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const size = Math.max(rect.width, rect.height) * 2
    
    const newRipple = {
      x,
      y,
      size,
      id: rippleCount
    }
    
    setRippleEffect(prev => [...prev, newRipple])
    setRippleCount(prev => prev + 1)
    
    setTimeout(() => {
      setRippleEffect(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 1000)
  }
  
  const variantStyles = {
    primary: {
      background: "bg-gradient-to-r from-blue-500 to-indigo-600",
      hover: "hover:from-blue-600 hover:to-indigo-700",
      text: "text-white",
      border: "border-blue-600",
      glow: "rgba(79, 70, 229, 0.6)",
      ripple: "bg-blue-200 bg-opacity-30",
      loading: "border-blue-200 border-t-blue-600"
    },
    secondary: {
      background: "bg-gradient-to-r from-gray-700 to-gray-900",
      hover: "hover:from-gray-800 hover:to-gray-950",
      text: "text-gray-100",
      border: "border-gray-600",
      glow: "rgba(107, 114, 128, 0.6)",
      ripple: "bg-gray-200 bg-opacity-30",
      loading: "border-gray-400 border-t-gray-200"
    },
    success: {
      background: "bg-gradient-to-r from-emerald-500 to-green-600",
      hover: "hover:from-emerald-600 hover:to-green-700",
      text: "text-white",
      border: "border-green-600",
      glow: "rgba(16, 185, 129, 0.6)",
      ripple: "bg-green-200 bg-opacity-30",
      loading: "border-green-200 border-t-green-600"
    },
    danger: {
      background: "bg-gradient-to-r from-red-500 to-rose-600",
      hover: "hover:from-red-600 hover:to-rose-700",
      text: "text-white",
      border: "border-red-600",
      glow: "rgba(225, 29, 72, 0.6)",
      ripple: "bg-red-200 bg-opacity-30",
      loading: "border-red-200 border-t-red-600"
    },
    warning: {
      background: "bg-gradient-to-r from-amber-400 to-orange-500",
      hover: "hover:from-amber-500 hover:to-orange-600",
      text: "text-white",
      border: "border-amber-500",
      glow: "rgba(251, 191, 36, 0.6)",
      ripple: "bg-amber-200 bg-opacity-30",
      loading: "border-amber-200 border-t-amber-500"
    },
    info: {
      background: "bg-gradient-to-r from-cyan-500 to-sky-600",
      hover: "hover:from-cyan-600 hover:to-sky-700",
      text: "text-white",
      border: "border-cyan-600",
      glow: "rgba(6, 182, 212, 0.6)",
      ripple: "bg-cyan-200 bg-opacity-30",
      loading: "border-cyan-200 border-t-cyan-600"
    },
    ghost: {
      background: "bg-transparent backdrop-blur-sm",
      hover: "hover:bg-white hover:bg-opacity-10",
      text: "text-white",
      border: "border-white border-opacity-30",
      glow: "rgba(255, 255, 255, 0.3)",
      ripple: "bg-white bg-opacity-20",
      loading: "border-white border-opacity-20 border-t-white"
    }
  }
  
  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 rounded-md",
    md: "text-sm px-4 py-2 rounded-lg",
    lg: "text-base px-6 py-3 rounded-xl"
  }
  
  const glowEffectStyles = {
    none: "",
    subtle: "shadow-md transition-shadow duration-300",
    intense: "shadow-lg transition-shadow duration-300"
  }
  
  const animationTypeStyles = {
    ripple: "overflow-hidden transition-transform duration-200 active:scale-95",
    pulse: "animate-pulse transition-transform duration-200 active:scale-95",
    glitch: "transition-all duration-300 active:scale-95 glitch-effect",
    magnetic: "transition-all duration-300",
    none: "transition-colors duration-200 active:scale-95"
  }
  
  const variantStyle = variantStyles[variant]
  const sizeStyle = sizeStyles[size]
  const glowStyle = glowEffectStyles[glowEffect]
  const animationStyle = animationTypeStyles[animationType]
  
  useEffect(() => {
    if (animationType !== 'magnetic') return
    
    const handleMouseLeave = () => {
      resetMagneticEffect()
    }
    
    const button = buttonRef.current
    if (button) {
      button.addEventListener('mouseleave', handleMouseLeave)
      return () => {
        button.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [animationType])
  
  return (
    <button
      ref={buttonRef}
      className={`
        relative group font-medium border border-opacity-30 select-none 
        inline-flex items-center justify-center transition-all
        ${variantStyle.background} ${variantStyle.hover} ${variantStyle.text} ${variantStyle.border}
        ${sizeStyle} ${glowStyle} ${animationStyle} ${fullWidth ? 'w-full' : ''}
        ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        resetMagneticEffect()
      }}
      onMouseMove={handleMouseMove}
      onClick={createRipple}
      style={
        animationType === 'magnetic' 
          ? { 
              transform: `translate(${buttonPosition.x}px, ${buttonPosition.y}px)`, 
              boxShadow: isHovered && glowEffect !== 'none' 
                ? `0 0 ${glowEffect === 'intense' ? '25px' : '15px'} ${variantStyle.glow}` 
                : 'none'
            } 
          : { 
              boxShadow: isHovered && glowEffect !== 'none' 
                ? `0 0 ${glowEffect === 'intense' ? '25px' : '15px'} ${variantStyle.glow}` 
                : 'none'
            }
      }
      {...props}
    >
      {animationType === 'ripple' && rippleEffect.map(ripple => (
        <span
          key={ripple.id}
          className={`absolute rounded-full ${variantStyle.ripple} animate-ripple`}
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size
          }}
        />
      ))}
      
      {animationType === 'glitch' && isHovered && (
        <>
          <span className="absolute inset-0 block translate-x-0.5 -translate-y-0.5 bg-inherit opacity-30" />
          <span className="absolute inset-0 block -translate-x-0.5 translate-y-0.5 bg-inherit opacity-30" />
        </>
      )}
      
      {icon && iconPosition === 'left' && (
        <span className={`inline-flex ${children ? 'mr-2' : ''}`}>
          {icon}
        </span>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center">
          <div className={`animate-spin rounded-full h-4 w-4 border-2 ${variantStyle.loading} mr-2`}></div>
          {children && <span>{children}</span>}
        </div>
      ) : (
        children
      )}
      
      {icon && iconPosition === 'right' && (
        <span className={`inline-flex ${children ? 'ml-2' : ''}`}>
          {icon}
        </span>
      )}
      
      {animationType === 'pulse' && !disabled && (
        <span className={`absolute inset-0 rounded-xl ${variantStyle.border} opacity-0 group-hover:opacity-100 animate-ping`}></span>
      )}
    </button>
  )
}

// Main BS Companion Landing Page Component
const BSCompanionLandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  const { scrollY: motionScrollY } = useScroll()
  useMotionValueEvent(motionScrollY, "change", (latest) => {
    setScrollY(latest)
    setIsScrolled(latest > 10)
  })

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemFadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const headerVariants = {
    top: {
      backgroundColor: "rgba(17, 17, 17, 0.8)",
      borderBottomColor: "rgba(55, 65, 81, 0.5)",
      position: 'fixed' as const,
      boxShadow: 'none',
    },
    scrolled: {
      backgroundColor: "rgba(17, 17, 17, 0.95)",
      borderBottomColor: "rgba(75, 85, 99, 0.7)",
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      position: 'fixed' as const
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <motion.div 
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 80%, rgba(120,119,198,0.2) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(255,119,198,0.2) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 40%, rgba(119,198,255,0.2) 0%, transparent 50%)",
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      {/* Header */}
      <motion.header
        variants={headerVariants}
        initial="top"
        animate={isScrolled ? "scrolled" : "top"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="sticky top-0 z-50 w-full border-b backdrop-blur-md"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            >
              <Brain className="h-6 w-6 text-white" />
            </motion.div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              BS Companion
            </span>
          </div>

          <nav className="hidden md:flex gap-6">
            <a href="#features" className="text-sm font-medium transition-colors hover:text-blue-400">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium transition-colors hover:text-blue-400">
              How It Works
            </a>
            <a href="#community" className="text-sm font-medium transition-colors hover:text-blue-400">
              Community
            </a>
            <a href="#testimonials" className="text-sm font-medium transition-colors hover:text-blue-400">
              Reviews
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              Sign In
            </Button>
            <PulseButton variant="primary" size="md" animationType="ripple">
              Get Started
            </PulseButton>
          </div>

          <button className="flex md:hidden" onClick={toggleMenu}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md md:hidden"
          >
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  BS Companion
                </span>
              </div>
              <button onClick={toggleMenu}>
                <X className="h-6 w-6" />
                <span className="sr-only">Close menu</span>
              </button>
            </div>
            <motion.nav
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="container mx-auto grid gap-4 px-4 pb-8 pt-6"
            >
              {["Features", "How It Works", "Community", "Reviews"].map((item, index) => (
                <motion.div key={index} variants={itemFadeIn}>
                  <a
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-lg font-medium hover:bg-white/10"
                    onClick={toggleMenu}
                  >
                    {item}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </motion.div>
              ))}
              <motion.div variants={itemFadeIn} className="flex flex-col gap-3 pt-4">
                <Button variant="ghost" className="w-full text-white hover:bg-white/10">
                  Sign In
                </Button>
                <PulseButton variant="primary" fullWidth>
                  Get Started
                </PulseButton>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="flex flex-col justify-center space-y-6"
              >
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-2 text-sm backdrop-blur-sm"
                  >
                    <Zap className="mr-2 h-4 w-4 text-blue-400" />
                    For BS Students, By BS Students
                  </motion.div>
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                  >
                    Master Your Studies with{" "}
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      Smart Quizzes
                    </span>{" "}
                    & Social Learning
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="max-w-[600px] text-gray-300 md:text-xl"
                  >
                    Join thousands of BS students using AI-powered quizzes, collaborative study groups, and peer-to-peer learning to excel in their academics.
                  </motion.p>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                  className="flex flex-col gap-4 sm:flex-row"
                >
                  <PulseButton 
                    variant="primary" 
                    size="lg" 
                    animationType="ripple"
                    icon={<Play className="h-5 w-5" />}
                    glowEffect="intense"
                  >
                    Start Learning Now
                  </PulseButton>
                  
                  <PulseButton 
                    variant="ghost" 
                    size="lg" 
                    animationType="magnetic"
                    icon={<Download className="h-5 w-5" />}
                  >
                    Download App
                  </PulseButton>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.8 }}
                  className="flex items-center gap-6 pt-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-slate-900"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">10,000+ active students</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-400 ml-1">4.9/5 rating</span>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex items-center justify-center"
              >
                <div className="relative">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 20, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                    className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl"
                  />
                  <div className="relative h-[400px] w-full md:h-[500px] lg:h-[600px] rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-white/10 p-8 flex flex-col items-center justify-center">
                    <motion.div
                      animate={{ y: [-10, 10, -10] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="text-center space-y-6"
                    >
                      <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Brain className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold">Interactive Learning</h3>
                      <p className="text-gray-400">AI-powered quizzes adapt to your learning style</p>
                      <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
                          <div className="text-green-400 font-bold text-lg">85%</div>
                          <div className="text-xs text-gray-400">Avg. Score</div>
                        </div>
                        <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
                          <div className="text-blue-400 font-bold text-lg">1,247</div>
                          <div className="text-xs text-gray-400">Quizzes Taken</div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container mx-auto px-4 md:px-6"
          >
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-2 text-sm backdrop-blur-sm"
                >
                  Features
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
                >
                  Everything You Need to Excel
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mx-auto max-w-[900px] text-gray-400 md:text-xl/relaxed"
                >
                  Comprehensive tools designed specifically for BS students to enhance learning and academic performance
                </motion.p>
              </div>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3"
            >
              {[
                {
                  icon: <Brain className="h-10 w-10 text-blue-400" />,
                  title: "AI-Powered Quizzes",
                  description: "Adaptive quizzes that learn from your performance and focus on areas needing improvement.",
                  gradient: "from-blue-500/20 to-cyan-500/20",
                  border: "border-blue-500/30"
                },
                {
                  icon: <Users className="h-10 w-10 text-purple-400" />,
                  title: "Study Groups",
                  description: "Connect with classmates, form study groups, and collaborate on challenging subjects.",
                  gradient: "from-purple-500/20 to-pink-500/20",
                  border: "border-purple-500/30"
                },
                {
                  icon: <MessageCircle className="h-10 w-10 text-green-400" />,
                  title: "Peer Discussion",
                  description: "Ask questions, share knowledge, and get help from fellow BS students in real-time.",
                  gradient: "from-green-500/20 to-emerald-500/20",
                  border: "border-green-500/30"
                },
                {
                  icon: <BookOpen className="h-10 w-10 text-orange-400" />,
                  title: "Subject Libraries",
                  description: "Access curated content for all BS subjects with notes, examples, and practice problems.",
                  gradient: "from-orange-500/20 to-red-500/20",
                  border: "border-orange-500/30"
                },
                {
                  icon: <Trophy className="h-10 w-10 text-yellow-400" />,
                  title: "Progress Tracking",
                  description: "Monitor your learning progress with detailed analytics and achievement badges.",
                  gradient: "from-yellow-500/20 to-amber-500/20",
                  border: "border-yellow-500/30"
                },
                {
                  icon: <Target className="h-10 w-10 text-indigo-400" />,
                  title: "Goal Setting",
                  description: "Set academic goals, track milestones, and stay motivated throughout your BS journey.",
                  gradient: "from-indigo-500/20 to-blue-500/20",
                  border: "border-indigo-500/30"
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemFadeIn}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border ${feature.border} p-6 transition-all hover:shadow-xl`}
                >
                  <div className="relative space-y-4">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-400 underline-offset-4 hover:underline cursor-pointer">
                      Learn more
                    </span>
                    <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                      <ArrowRight className="h-4 w-4 text-blue-400" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container mx-auto px-4 md:px-6"
          >
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-block rounded-full bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 text-sm backdrop-blur-sm"
              >
                How It Works
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
              >
                Get Started in 3 Simple Steps
              </motion.h2>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-8 md:grid-cols-3"
            >
              {[
                {
                  step: "01",
                  title: "Sign Up & Choose Subjects",
                  description: "Create your account and select your BS subjects to get personalized content.",
                  icon: <Users className="h-8 w-8" />
                },
                {
                  step: "02", 
                  title: "Take Smart Quizzes",
                  description: "Start with AI-powered quizzes that adapt to your knowledge level and learning pace.",
                  icon: <Brain className="h-8 w-8" />
                },
                {
                  step: "03",
                  title: "Connect & Collaborate",
                  description: "Join study groups, participate in discussions, and learn together with peers.",
                  icon: <MessageCircle className="h-8 w-8" />
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  variants={itemFadeIn}
                  className="relative text-center"
                >
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                    {step.icon}
                  </div>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-white/5">
                    {step.step}
                  </div>
                  <h3 className="mb-4 text-xl font-bold">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 left-full w-full">
                      <ArrowRight className="h-6 w-6 text-gray-600 mx-auto" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Community Section */}
        <section id="community" className="w-full py-12 md:py-24 lg:py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container mx-auto px-4 md:px-6"
          >
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="inline-block rounded-full bg-green-500/10 border border-green-500/20 px-4 py-2 text-sm backdrop-blur-sm">
                  Community
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Join a Thriving Learning Community
                </h2>
                <p className="text-gray-400 md:text-xl/relaxed">
                  Connect with thousands of BS students across the country. Share knowledge, get help, and build lasting study partnerships.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-400">10,000+</div>
                    <div className="text-sm text-gray-400">Active Students</div>
                  </div>
                  <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">500+</div>
                    <div className="text-sm text-gray-400">Study Groups</div>
                  </div>
                  <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                    <div className="text-2xl font-bold text-green-400">50,000+</div>
                    <div className="text-sm text-gray-400">Questions Answered</div>
                  </div>
                  <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-400">95%</div>
                    <div className="text-sm text-gray-400">Success Rate</div>
                  </div>
                </div>

                <PulseButton 
                  variant="success" 
                  size="lg" 
                  animationType="pulse"
                  icon={<Users className="h-5 w-5" />}
                >
                  Join Community
                </PulseButton>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-center"
              >
                <div className="relative h-[400px] w-full rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-white/10 p-6 overflow-hidden">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recent Discussions</h3>
                    {[
                      { user: "Ahmed K.", subject: "Calculus", question: "Need help with integration by parts...", time: "2m ago", avatar: "bg-blue-500" },
                      { user: "Fatima S.", subject: "Physics", question: "Can someone explain quantum mechanics?", time: "5m ago", avatar: "bg-purple-500" },
                      { user: "Hassan M.", subject: "Chemistry", question: "Organic chemistry reactions help needed", time: "8m ago", avatar: "bg-green-500" },
                    ].map((discussion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 rounded-lg p-4 border border-white/10"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`h-8 w-8 rounded-full ${discussion.avatar} flex items-center justify-center text-white text-sm font-bold`}>
                            {discussion.user.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{discussion.user}</span>
                              <span className="text-xs text-blue-400">#{discussion.subject}</span>
                              <span className="text-xs text-gray-500">{discussion.time}</span>
                            </div>
                            <p className="text-sm text-gray-300">{discussion.question}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container mx-auto px-4 md:px-6"
          >
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-block rounded-full bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 text-sm backdrop-blur-sm"
              >
                Student Reviews
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
              >
                What Students Are Saying
              </motion.h2>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {[
                {
                  quote: "BS Companion transformed my study routine. The AI quizzes helped me identify weak areas and the community support is amazing!",
                  author: "Sarah Ahmed",
                  program: "BS Computer Science",
                  university: "LUMS",
                  rating: 5,
                  avatar: "bg-blue-500"
                },
                {
                  quote: "The study groups feature is incredible. I found my study buddies and we've been acing our exams together!",
                  author: "Muhammad Hassan",
                  program: "BS Mathematics", 
                  university: "NUST",
                  rating: 5,
                  avatar: "bg-purple-500"
                },
                {
                  quote: "Finally, a platform made specifically for Pakistani BS students. The content is relevant and the community is so helpful.",
                  author: "Ayesha Khan",
                  program: "BS Physics",
                  university: "FAST",
                  rating: 5,
                  avatar: "bg-green-500"
                },
                {
                  quote: "My grades improved significantly after using BS Companion. The adaptive quizzes are a game-changer!",
                  author: "Ali Raza",
                  program: "BS Chemistry",
                  university: "UET",
                  rating: 5,
                  avatar: "bg-orange-500"
                },
                {
                  quote: "The peer discussion feature saved me countless times. Getting help from seniors and helping juniors creates a great learning environment.",
                  author: "Zainab Malik",
                  program: "BS Biology",
                  university: "PU",
                  rating: 5,
                  avatar: "bg-pink-500"
                },
                {
                  quote: "Love how the app tracks my progress and motivates me to keep learning. The achievement system is addictive in the best way!",
                  author: "Omar Sheikh",
                  program: "BS Engineering",
                  university: "GIKI",
                  rating: 5,
                  avatar: "bg-cyan-500"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={itemFadeIn}
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-300 mb-4">"{testimonial.quote}"</blockquote>
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full ${testimonial.avatar} flex items-center justify-center text-white font-bold`}>
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-gray-400">{testimonial.program}</p>
                      <p className="text-xs text-gray-500">{testimonial.university}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container mx-auto px-4 md:px-6"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 p-8 md:p-12 lg:p-16">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
              <div className="relative text-center space-y-6">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
                >
                  Ready to Transform Your Studies?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mx-auto max-w-[600px] text-gray-300 md:text-xl"
                >
                  Join thousands of BS students who are already excelling with BS Companion. Start your journey to academic success today!
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-col gap-4 sm:flex-row sm:justify-center"
                >
                  <PulseButton 
                    variant="primary" 
                    size="lg" 
                    animationType="ripple"
                    icon={<ArrowRight className="h-5 w-5" />}
                    iconPosition="right"
                    glowEffect="intense"
                  >
                    Get Started Free
                  </PulseButton>
                  <PulseButton 
                    variant="ghost" 
                    size="lg" 
                    animationType="magnetic"
                    icon={<MessageCircle className="h-5 w-5" />}
                  >
                    Contact Support
                  </PulseButton>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="container mx-auto grid gap-8 px-4 py-10 md:px-6 lg:grid-cols-4"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                BS Companion
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Empowering BS students across Pakistan with smart learning tools and collaborative study environments.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: <Instagram className="h-5 w-5" />, label: "Instagram" },
                { icon: <Twitter className="h-5 w-5" />, label: "Twitter" },
                { icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn" },
                { icon: <Facebook className="h-5 w-5" />, label: "Facebook" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ y: -2, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {social.icon}
                  <span className="sr-only">{social.label}</span>
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Features</h3>
            <nav className="flex flex-col space-y-2 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">AI Quizzes</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Study Groups</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Progress Tracking</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Peer Discussion</a>
            </nav>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Support</h3>
            <nav className="flex flex-col space-y-2 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Community Guidelines</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Report Issue</a>
            </nav>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Stay Updated</h3>
            <p className="text-sm text-gray-400 mb-4">
              Get the latest updates on new features and study tips.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
              <PulseButton variant="primary" size="sm" icon={<Send className="h-4 w-4" />}>
                Subscribe
              </PulseButton>
            </div>
          </div>
        </motion.div>

        <div className="border-t border-white/10">
          <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-6 md:flex-row px-4 md:px-6">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} BS Companion. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default BSCompanionLandingPage