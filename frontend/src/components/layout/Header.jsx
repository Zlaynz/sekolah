import { Menu, LogOut, Camera, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SearchBar from '../common/SearchBar';
import UserAvatar from '../common/UserAvatar';
import PhotoUploadModal from '../common/PhotoUploadModal';
import { ROLE_LABELS } from '../../utils/constants';
import { useState, useRef, useEffect } from 'react';

export default function Header({ onMenuClick }) {
  const { user, logout, updatePhoto } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <SearchBar />
          </div>

          {/* Right side */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
            >
              <UserAvatar
                photoPath={user?.photoPath}
                name={user?.name || user?.username}
                size="sm"
              />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700">{user?.name || user?.username}</p>
                <p className="text-xs text-gray-500">{ROLE_LABELS[user?.role] || user?.role}</p>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2">
                  <UserAvatar
                    photoPath={user?.photoPath}
                    name={user?.name || user?.username}
                    size="xs"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-gray-800 truncate">{user?.name || user?.username}</p>
                    <p className="text-[10px] text-gray-500">{ROLE_LABELS[user?.role] || user?.role}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setPhotoModalOpen(true);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <Camera className="w-4 h-4 text-indigo-600" />
                  Ubah Foto Profil
                </button>

                <div className="border-t border-gray-100 my-1" />

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Photo Modal */}
      <PhotoUploadModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        currentPhoto={user?.photoPath}
        userName={user?.name || user?.username}
        targetType="auth"
        onSuccess={(newPath) => updatePhoto(newPath)}
      />
    </>
  );
}
