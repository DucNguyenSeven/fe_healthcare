// Export all Header components and types
export { Header } from './Header';
export { HeaderToolbar } from './HeaderToolbar';
export { HeaderDrawer } from './HeaderDrawer';
export { UserMenu } from './UserMenu';
export * from './types';

// Export Header as default for MainLayout compatibility
import { Header } from './Header';
export default Header;
