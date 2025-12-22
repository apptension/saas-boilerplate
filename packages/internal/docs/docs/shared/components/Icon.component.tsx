import React from 'react';
import {
  Rocket,
  Zap,
  Palette,
  Shield,
  Users,
  CreditCard,
  Mail,
  Bell,
  Bot,
  Building2,
  GitBranch,
  Server,
  Code2,
  Settings,
  FileText,
  FolderOpen,
  Database,
  Globe,
  Lock,
  Key,
  Workflow,
  Layers,
  Terminal,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Github,
  Check,
  X,
  AlertCircle,
  Info,
  HelpCircle,
  Star,
  Heart,
  BookOpen,
  Lightbulb,
  Wrench,
  Cog,
  Play,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  // Feature icons
  rocket: Rocket,
  zap: Zap,
  palette: Palette,
  shield: Shield,
  users: Users,
  'credit-card': CreditCard,
  mail: Mail,
  bell: Bell,
  bot: Bot,
  building: Building2,
  'git-branch': GitBranch,
  server: Server,
  code: Code2,
  settings: Settings,
  'file-text': FileText,
  folder: FolderOpen,
  database: Database,
  globe: Globe,
  lock: Lock,
  key: Key,
  workflow: Workflow,
  layers: Layers,
  terminal: Terminal,
  
  // Arrows
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  
  // Actions
  'external-link': ExternalLink,
  github: Github,
  check: Check,
  x: X,
  
  // Status
  'alert-circle': AlertCircle,
  info: Info,
  'help-circle': HelpCircle,
  
  // Misc
  star: Star,
  heart: Heart,
  'book-open': BookOpen,
  lightbulb: Lightbulb,
  wrench: Wrench,
  cog: Cog,
  play: Play,
};

interface IconProps {
  name: keyof typeof iconMap | string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 20, 
  className = '',
  strokeWidth = 2,
}) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return (
    <IconComponent 
      size={size} 
      className={className}
      strokeWidth={strokeWidth}
    />
  );
};

export default Icon;

// Export individual icons for direct use
export {
  Rocket,
  Zap,
  Palette,
  Shield,
  Users,
  CreditCard,
  Mail,
  Bell,
  Bot,
  Building2,
  GitBranch,
  Server,
  Code2,
  Settings,
  FileText,
  FolderOpen,
  Database,
  Globe,
  Lock,
  Key,
  Workflow,
  Layers,
  Terminal,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Github,
  Check,
  X,
  AlertCircle,
  Info,
  HelpCircle,
  Star,
  Heart,
  BookOpen,
  Lightbulb,
  Wrench,
  Cog,
  Play,
};

