import { useMutation, useQuery } from '@apollo/client/react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Button } from '@sb/webapp-core/components/buttons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@sb/webapp-core/components/ui/alert-dialog';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@sb/webapp-core/components/ui/dialog';
import { Input } from '@sb/webapp-core/components/forms';
import { Label } from '@sb/webapp-core/components/ui/label';
import { Separator } from '@sb/webapp-core/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sb/webapp-core/components/ui/select';
import { Skeleton } from '@sb/webapp-core/components/ui/skeleton';
import { TabsContent } from '@sb/webapp-core/components/ui/tabs';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { cn } from '@sb/webapp-core/lib/utils';
import {
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Crown,
  Edit2,
  Layers,
  Lock,
  Minus,
  Plus,
  Settings,
  Shield,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';

// Simple checkbox using Radix primitives with proper styling
const SimpleCheckbox = ({
  checked,
  onCheckedChange,
  disabled,
  indeterminate,
  className,
}: {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  className?: string;
}) => (
  <CheckboxPrimitive.Root
    checked={indeterminate ? 'indeterminate' : checked}
    onCheckedChange={(val) => onCheckedChange?.(val === true)}
    disabled={disabled}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-[4px] border border-input',
      'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground',
      'data-[state=indeterminate]:bg-primary/70 data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-foreground',
      'transition-colors',
      className
    )}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      {indeterminate ? (
        <Minus className="h-3 w-3" strokeWidth={3} />
      ) : (
        <Check className="h-3 w-3" strokeWidth={3} />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { RoutesConfig } from '../../../config/routes';
import { useGenerateTenantPath, usePermissionCheck } from '../../../hooks';
import { useCurrentTenant } from '../../../providers';
import {
  allOrganizationRolesQuery,
  allPermissionsQuery,
  createOrganizationRoleMutation,
  deleteOrganizationRoleMutation,
  updateOrganizationRoleMutation,
} from './tenantRoles.graphql';

// Role color options with better visual design
const ROLE_COLORS = [
  { value: 'BLUE', label: 'Blue', className: 'bg-blue-500', ring: 'ring-blue-500/30' },
  { value: 'GREEN', label: 'Green', className: 'bg-emerald-500', ring: 'ring-emerald-500/30' },
  { value: 'RED', label: 'Red', className: 'bg-rose-500', ring: 'ring-rose-500/30' },
  { value: 'YELLOW', label: 'Yellow', className: 'bg-amber-500', ring: 'ring-amber-500/30' },
  { value: 'PURPLE', label: 'Purple', className: 'bg-violet-500', ring: 'ring-violet-500/30' },
  { value: 'ORANGE', label: 'Orange', className: 'bg-orange-500', ring: 'ring-orange-500/30' },
  { value: 'PINK', label: 'Pink', className: 'bg-pink-500', ring: 'ring-pink-500/30' },
  { value: 'TEAL', label: 'Teal', className: 'bg-teal-500', ring: 'ring-teal-500/30' },
  { value: 'GRAY', label: 'Gray', className: 'bg-slate-500', ring: 'ring-slate-500/30' },
] as const;

// Permission category configuration
const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
  ORGANIZATION: {
    label: 'Organization',
    icon: <Settings className="h-4 w-4" />,
    description: 'Organization settings and configuration',
  },
  MEMBERS: {
    label: 'Members',
    icon: <Users className="h-4 w-4" />,
    description: 'Team member management',
  },
  SECURITY: {
    label: 'Security',
    icon: <Lock className="h-4 w-4" />,
    description: 'Security and authentication settings',
  },
  BILLING: {
    label: 'Billing',
    icon: <CreditCard className="h-4 w-4" />,
    description: 'Subscription and payment management',
  },
  FEATURES: {
    label: 'Features',
    icon: <Sparkles className="h-4 w-4" />,
    description: 'AI, Documents, and other features',
  },
  DASHBOARD: {
    label: 'Dashboard',
    icon: <Layers className="h-4 w-4" />,
    description: 'Main application dashboard',
  },
  MANAGEMENT: {
    label: 'Management Dashboard',
    icon: <BarChart3 className="h-4 w-4" />,
    description: 'Finance and management tools',
  },
};

interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
}

interface OrganizationRole {
  id: string;
  name: string;
  description?: string;
  color: string;
  systemRoleType?: string;
  isSystemRole: boolean;
  isOwnerRole: boolean;
  memberCount: number;
  permissions: Permission[];
}

// Color badge component with better styling
const RoleColorBadge = ({ color, size = 'sm' }: { color: string; size?: 'sm' | 'md' | 'lg' }) => {
  const colorConfig = ROLE_COLORS.find((c) => c.value.toUpperCase() === color?.toUpperCase()) || ROLE_COLORS[0];
  const sizeClass = size === 'lg' ? 'h-4 w-4' : size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3';
  return (
    <div className={cn('rounded-full ring-2', colorConfig.className, colorConfig.ring, sizeClass)} />
  );
};

// Enhanced Role Card component
const RoleCard = ({
  role,
  onEdit,
  onDelete,
  canManage = false,
}: {
  role: OrganizationRole;
  onEdit: () => void;
  onDelete: () => void;
  canManage?: boolean;
}) => {
  const intl = useIntl();

  return (
    <Card className={cn(
      'group relative overflow-hidden transition-all duration-200 h-full flex flex-col',
      'hover:shadow-md hover:border-primary/30',
      'bg-gradient-to-br from-card to-card/80'
    )}>
      {/* Color accent bar */}
      <div className={cn(
        'absolute top-0 left-0 right-0 h-1',
        ROLE_COLORS.find((c) => c.value.toUpperCase() === role.color?.toUpperCase())?.className || 'bg-blue-500'
      )} />
      
      <CardHeader className="pt-5 pb-3 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={cn(
              'flex items-center justify-center rounded-lg p-2.5 shrink-0',
              'bg-gradient-to-br',
              role.isOwnerRole 
                ? 'from-violet-100 to-violet-50 dark:from-violet-900/30 dark:to-violet-950/30' 
                : 'from-muted to-muted/50'
            )}>
              {role.isOwnerRole ? (
                <Crown className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              ) : (
                <RoleColorBadge color={role.color} size="md" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base font-semibold truncate">
                  {role.name}
                </CardTitle>
                {role.isSystemRole && !role.isOwnerRole && (
                  <Badge variant="secondary" className="text-[10px] font-medium px-1.5 py-0 h-5">
                    <FormattedMessage defaultMessage="System" id="Roles / System Badge" />
                  </Badge>
                )}
              </div>
              {role.description && (
                <CardDescription className="mt-1 text-xs line-clamp-2">
                  {role.description}
                </CardDescription>
              )}
            </div>
          </div>
          
          {/* Actions - visible on hover on desktop, always visible on mobile */}
          {canManage && (
            <div className={cn(
              'flex items-center gap-1 shrink-0',
              'md:opacity-0 md:group-hover:opacity-100 transition-opacity'
            )}>
              {!role.isOwnerRole && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              )}
              {!role.isSystemRole && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                  onClick={onDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-4 mt-auto">
        <Separator className="mb-3" />
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span className="font-medium">
              {role.memberCount}{' '}
              {role.memberCount === 1 ? (
                <FormattedMessage defaultMessage="member" id="Roles / Member singular" />
              ) : (
                <FormattedMessage defaultMessage="members" id="Roles / Members plural" />
              )}
            </span>
          </div>
          <div>
            {role.isOwnerRole ? (
              <Badge variant="outline" className="text-[10px] font-medium">
                <FormattedMessage defaultMessage="All permissions" id="Roles / All permissions" />
              </Badge>
            ) : (
              <span className="text-muted-foreground font-medium">
                {role.permissions.length}{' '}
                <FormattedMessage defaultMessage="permissions" id="Roles / Permissions count" />
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Permission picker component
const PermissionPicker = ({
  allPermissions,
  selectedPermissionIds,
  onSelectionChange,
  disabled,
}: {
  allPermissions: Permission[];
  selectedPermissionIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  disabled?: boolean;
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['ORGANIZATION', 'MEMBERS', 'FEATURES'])
  );

  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    const grouped: Record<string, Permission[]> = {};
    allPermissions.forEach((perm) => {
      if (!grouped[perm.category]) {
        grouped[perm.category] = [];
      }
      grouped[perm.category].push(perm);
    });
    return grouped;
  }, [allPermissions]);

  // Order categories
  const orderedCategories = useMemo(() => {
    const order = ['ORGANIZATION', 'MEMBERS', 'SECURITY', 'BILLING', 'FEATURES', 'DASHBOARD', 'MANAGEMENT'];
    return order.filter((cat) => permissionsByCategory[cat]);
  }, [permissionsByCategory]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const togglePermission = (permId: string) => {
    const newSelected = new Set(selectedPermissionIds);
    if (newSelected.has(permId)) {
      newSelected.delete(permId);
    } else {
      newSelected.add(permId);
    }
    onSelectionChange(newSelected);
  };

  const toggleCategoryAll = (category: string, permissions: Permission[]) => {
    const categoryIds = permissions.map((p) => p.id);
    const allSelected = categoryIds.every((id) => selectedPermissionIds.has(id));

    const newSelected = new Set(selectedPermissionIds);
    if (allSelected) {
      categoryIds.forEach((id) => newSelected.delete(id));
    } else {
      categoryIds.forEach((id) => newSelected.add(id));
    }
    onSelectionChange(newSelected);
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="h-[400px] overflow-y-auto">
        <div className="p-1">
          {orderedCategories.map((category, index) => {
            const permissions = permissionsByCategory[category];
            const config = CATEGORY_CONFIG[category] || { 
              label: category, 
              icon: <Shield className="h-4 w-4" />,
              description: ''
            };
            const isExpanded = expandedCategories.has(category);
            const categoryIds = permissions.map((p) => p.id);
            const selectedCount = categoryIds.filter((id) => selectedPermissionIds.has(id)).length;
            const allSelected = selectedCount === categoryIds.length;
            const someSelected = selectedCount > 0 && !allSelected;

            return (
              <div key={category} className="mb-1 last:mb-0">
                <button
                  type="button"
                  className={cn(
                    'flex items-center justify-between w-full px-3 py-2.5 rounded-md',
                    'text-left transition-colors',
                    'hover:bg-accent/50',
                    isExpanded && 'bg-accent/30'
                  )}
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={cn(
                      'flex items-center justify-center rounded-md p-1.5',
                      'bg-primary/10 text-primary'
                    )}>
                      {config.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{config.label}</span>
                        <Badge 
                          variant={allSelected ? 'default' : someSelected ? 'secondary' : 'outline'} 
                          className="text-[10px] h-5 px-1.5"
                        >
                          {selectedCount}/{categoryIds.length}
                        </Badge>
                      </div>
                      {config.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                          {config.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <SimpleCheckbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onCheckedChange={() => toggleCategoryAll(category, permissions)}
                      disabled={disabled}
                    />
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="ml-3 pl-3 border-l-2 border-border/50 space-y-0.5 py-1">
                    {permissions.map((perm) => (
                      <label
                        key={perm.id}
                        className={cn(
                          'flex items-start gap-3 px-3 py-2 rounded-md cursor-pointer',
                          'transition-colors hover:bg-accent/50',
                          selectedPermissionIds.has(perm.id) && 'bg-accent/30',
                          disabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <SimpleCheckbox
                          checked={selectedPermissionIds.has(perm.id)}
                          onCheckedChange={() => !disabled && togglePermission(perm.id)}
                          disabled={disabled}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm">{perm.name}</span>
                          {perm.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {perm.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Selection summary */}
      <div className="border-t px-4 py-3 bg-muted/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            <FormattedMessage defaultMessage="Selected permissions" id="Roles / Selected Permissions" />
          </span>
          <Badge variant="secondary" className="font-semibold">
            {selectedPermissionIds.size}
          </Badge>
        </div>
      </div>
    </div>
  );
};

// Enhanced Role editor dialog
const RoleEditorDialog = ({
  open,
  onOpenChange,
  role,
  allPermissions,
  tenantId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: OrganizationRole | null;
  allPermissions: Permission[];
  tenantId: string;
  onSuccess: () => void;
}) => {
  const intl = useIntl();
  const { toast } = useToast();
  const isEditing = !!role;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<string>('BLUE');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  // Reset form when role changes
  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || '');
      setColor(role.color);
      setSelectedPermissions(new Set(role.permissions.map((p) => p.id)));
    } else {
      setName('');
      setDescription('');
      setColor('BLUE');
      setSelectedPermissions(new Set());
    }
  }, [role]);

  const [createRole, { loading: creating }] = useMutation(createOrganizationRoleMutation, {
    onCompleted: () => {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Role created successfully',
          id: 'Roles / Create Success',
        }),
        variant: 'success',
      });
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({ description: error.message, variant: 'destructive' });
    },
  });

  const [updateRole, { loading: updating }] = useMutation(updateOrganizationRoleMutation, {
    onCompleted: () => {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Role updated successfully',
          id: 'Roles / Update Success',
        }),
        variant: 'success',
      });
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({ description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Role name is required',
          id: 'Roles / Name Required',
        }),
        variant: 'destructive',
      });
      return;
    }

    if (selectedPermissions.size === 0) {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'At least one permission is required',
          id: 'Roles / Permission Required',
        }),
        variant: 'destructive',
      });
      return;
    }

    const permissionIds = Array.from(selectedPermissions);

    if (isEditing && role) {
      updateRole({
        variables: {
          id: role.id,
          tenantId,
          name,
          description,
          color: color as any,
          permissionIds,
        },
      });
    } else {
      createRole({
        variables: {
          tenantId,
          name,
          description,
          color: color as any,
          permissionIds,
        },
      });
    }
  };

  const isLoading = creating || updating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 sm:p-0 gap-0 sm:gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {isEditing ? (
              <FormattedMessage defaultMessage="Edit Role" id="Roles / Edit Title" />
            ) : (
              <FormattedMessage defaultMessage="Create Role" id="Roles / Create Title" />
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? (
              <FormattedMessage
                defaultMessage="Modify role permissions and settings"
                id="Roles / Edit Description"
              />
            ) : (
              <FormattedMessage
                defaultMessage="Define a new role with specific permissions"
                id="Roles / Create Description"
              />
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Role Details Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <FormattedMessage defaultMessage="Role Details" id="Roles / Details Section" />
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <Label htmlFor="role-name" className="text-sm font-medium">
                    <FormattedMessage defaultMessage="Name" id="Roles / Name Label" />
                  </Label>
                  <Input
                    id="role-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={intl.formatMessage({
                      defaultMessage: 'e.g., Project Manager',
                      id: 'Roles / Name Placeholder',
                    })}
                    disabled={isLoading}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-color" className="text-sm font-medium">
                    <FormattedMessage defaultMessage="Color" id="Roles / Color Label" />
                  </Label>
                  <Select value={color} onValueChange={setColor} disabled={isLoading}>
                    <SelectTrigger id="role-color" className="w-[140px] h-10">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <RoleColorBadge color={color} size="sm" />
                          <span className="text-sm">{ROLE_COLORS.find((c) => c.value === color)?.label}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_COLORS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <RoleColorBadge color={c.value} size="sm" />
                            <span>{c.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-description" className="text-sm font-medium">
                  <FormattedMessage defaultMessage="Description" id="Roles / Description Label" />
                  <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                </Label>
                <textarea
                  id="role-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={intl.formatMessage({
                    defaultMessage: 'Describe what this role is for...',
                    id: 'Roles / Description Placeholder',
                  })}
                  rows={2}
                  disabled={isLoading}
                  className={cn(
                    'w-full rounded-md border bg-transparent px-3 py-2 text-sm',
                    'border-input placeholder:text-muted-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    'resize-none'
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Permissions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    <FormattedMessage defaultMessage="Permissions" id="Roles / Permissions Label" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    <FormattedMessage 
                      defaultMessage="Select the permissions this role should have" 
                      id="Roles / Permissions Hint" 
                    />
                  </p>
                </div>
              </div>
              <PermissionPicker
                allPermissions={allPermissions}
                selectedPermissionIds={selectedPermissions}
                onSelectionChange={setSelectedPermissions}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              <FormattedMessage defaultMessage="Cancel" id="Roles / Cancel Button" />
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <FormattedMessage defaultMessage="Saving..." id="Roles / Saving Button" />
              ) : isEditing ? (
                <FormattedMessage defaultMessage="Save Changes" id="Roles / Save Button" />
              ) : (
                <FormattedMessage defaultMessage="Create Role" id="Roles / Create Button" />
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Enhanced Delete confirmation dialog
const DeleteRoleDialog = ({
  open,
  onOpenChange,
  role,
  allRoles,
  tenantId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: OrganizationRole | null;
  allRoles: OrganizationRole[];
  tenantId: string;
  onSuccess: () => void;
}) => {
  const intl = useIntl();
  const { toast } = useToast();
  const [replacementRoleId, setReplacementRoleId] = useState<string>('');

  const availableReplacements = allRoles.filter((r) => r.id !== role?.id);
  const hasAffectedMembers = (role?.memberCount || 0) > 0;

  const [deleteRole, { loading }] = useMutation(deleteOrganizationRoleMutation, {
    onCompleted: (data) => {
      const affectedCount = data?.deleteOrganizationRole?.affectedMemberCount || 0;
      toast({
        description:
          affectedCount > 0
            ? intl.formatMessage(
                {
                  defaultMessage: 'Role deleted and {count} member(s) reassigned',
                  id: 'Roles / Delete Success With Reassign',
                },
                { count: affectedCount }
              )
            : intl.formatMessage({
                defaultMessage: 'Role deleted successfully',
                id: 'Roles / Delete Success',
              }),
        variant: 'success',
      });
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({ description: error.message, variant: 'destructive' });
    },
  });

  const handleDelete = () => {
    if (!role) return;

    if (hasAffectedMembers && !replacementRoleId) {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Please select a replacement role for affected members',
          id: 'Roles / Replacement Required',
        }),
        variant: 'destructive',
      });
      return;
    }

    deleteRole({
      variables: {
        id: role.id,
        tenantId,
        replacementRoleId: hasAffectedMembers ? replacementRoleId : undefined,
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-lg">
              <FormattedMessage defaultMessage="Delete Role" id="Roles / Delete Title" />
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                <FormattedMessage
                  defaultMessage='Are you sure you want to delete the role "{name}"? This action cannot be undone.'
                  id="Roles / Delete Confirmation"
                  values={{ name: <strong className="text-foreground">{role?.name}</strong> }}
                />
              </p>
              {hasAffectedMembers && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <Users className="h-4 w-4" />
                    <FormattedMessage
                      defaultMessage="This role is assigned to {count} member(s)"
                      id="Roles / Affected Members Warning"
                      values={{ count: role?.memberCount }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="replacement-role" className="text-xs font-medium">
                      <FormattedMessage
                        defaultMessage="Select replacement role:"
                        id="Roles / Replacement Role Label"
                      />
                    </Label>
                    <Select value={replacementRoleId} onValueChange={setReplacementRoleId}>
                      <SelectTrigger id="replacement-role" className="h-9">
                        <SelectValue
                          placeholder={intl.formatMessage({
                            defaultMessage: 'Select a role...',
                            id: 'Roles / Select Replacement Placeholder',
                          })}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableReplacements.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            <div className="flex items-center gap-2">
                              <RoleColorBadge color={r.color} size="sm" />
                              <span>{r.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel disabled={loading}>
            <FormattedMessage defaultMessage="Cancel" id="Roles / Cancel Button" />
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading || (hasAffectedMembers && !replacementRoleId)}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? (
              <FormattedMessage defaultMessage="Deleting..." id="Roles / Deleting Button" />
            ) : (
              <FormattedMessage defaultMessage="Delete Role" id="Roles / Delete Button" />
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Main component
export const TenantRoles = () => {
  const intl = useIntl();
  const generateTenantPath = useGenerateTenantPath();
  const { data: currentTenant } = useCurrentTenant();
  const tenantId = currentTenant?.id ?? '';

  // Permission check for managing roles
  const { hasPermission: canManageRoles } = usePermissionCheck('org.roles.manage');

  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<OrganizationRole | null>(null);

  // Fetch permissions (global query, no tenant required)
  const { data: permissionsData, loading: permissionsLoading } = useQuery(allPermissionsQuery);

  // Fetch roles
  const {
    data: rolesData,
    loading: rolesLoading,
    refetch: refetchRoles,
  } = useQuery(allOrganizationRolesQuery, {
    variables: { tenantId },
    skip: !tenantId,
    fetchPolicy: 'cache-and-network',
  });

  const allPermissions = useMemo(() => {
    return (permissionsData?.allPermissions?.edges || [])
      .map((edge) => edge?.node)
      .filter(Boolean) as Permission[];
  }, [permissionsData]);

  const allRoles = useMemo(() => {
    return (rolesData?.allOrganizationRoles?.edges || [])
      .map((edge) => edge?.node)
      .filter(Boolean) as OrganizationRole[];
  }, [rolesData]);

  const handleCreateRole = useCallback(() => {
    setSelectedRole(null);
    setEditorOpen(true);
  }, []);

  const handleEditRole = useCallback((role: OrganizationRole) => {
    setSelectedRole(role);
    setEditorOpen(true);
  }, []);

  const handleDeleteRole = useCallback((role: OrganizationRole) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    refetchRoles();
  }, [refetchRoles]);

  const isLoading = permissionsLoading || rolesLoading;

  // Separate system roles and custom roles
  const systemRoles = allRoles.filter((r) => r.isSystemRole);
  const customRoles = allRoles.filter((r) => !r.isSystemRole);

  return (
    <TabsContent value={generateTenantPath(RoutesConfig.tenant.settings.roles)} className="mt-0">
      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    <FormattedMessage defaultMessage="Roles" id="Roles / Title" />
                  </CardTitle>
                  <CardDescription className="mt-0.5">
                    <FormattedMessage
                      defaultMessage="Manage roles and their default billing rates"
                      id="Roles / Description"
                    />
                  </CardDescription>
                </div>
              </div>
              {canManageRoles && (
                <div className="flex items-center gap-2">
                  <Button onClick={handleCreateRole} disabled={isLoading} className="gap-2 shrink-0">
                    <Plus className="h-4 w-4" />
                    <FormattedMessage defaultMessage="Create Role" id="Roles / Create Button" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {isLoading ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-32" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* System Roles */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <FormattedMessage defaultMessage="System Roles" id="Roles / System Roles Header" />
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {systemRoles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    onEdit={() => handleEditRole(role)}
                    onDelete={() => handleDeleteRole(role)}
                    canManage={canManageRoles}
                  />
                ))}
              </div>
            </div>

            {/* Custom Roles */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <FormattedMessage defaultMessage="Custom Roles" id="Roles / Custom Roles Header" />
              </h3>
              {customRoles.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {customRoles.map((role) => (
                    <RoleCard
                      key={role.id}
                      role={role}
                      onEdit={() => handleEditRole(role)}
                      onDelete={() => handleDeleteRole(role)}
                      canManage={canManageRoles}
                    />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Shield className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">
                      <FormattedMessage
                        defaultMessage="No custom roles yet"
                        id="Roles / No Custom Roles"
                      />
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-[300px]">
                      <FormattedMessage
                        defaultMessage="Create custom roles to fine-tune member access and permissions"
                        id="Roles / No Custom Roles Description"
                      />
                    </p>
                    {canManageRoles && (
                      <Button onClick={handleCreateRole} variant="outline" className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        <FormattedMessage defaultMessage="Create your first role" id="Roles / Create First" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Role Editor Dialog */}
        <RoleEditorDialog
          open={editorOpen}
          onOpenChange={setEditorOpen}
          role={selectedRole}
          allPermissions={allPermissions}
          tenantId={tenantId}
          onSuccess={handleSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteRoleDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          role={selectedRole}
          allRoles={allRoles}
          tenantId={tenantId}
          onSuccess={handleSuccess}
        />
      </div>
    </TabsContent>
  );
};
