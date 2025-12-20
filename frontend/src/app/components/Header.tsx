import { motion } from 'motion/react';
import { Disc } from 'lucide-react';

export function Header() {
    return (
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-50 pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
                <Disc className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-white font-bold tracking-tight text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>GeminiDJ</span>
            </div>

            <div className="flex items-center gap-4 pointer-events-auto">
                <button className="text-gray-400 hover:text-white text-sm transition-colors font-medium cursor-pointer">Log in</button>
                <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md border border-white/10 transition-all cursor-pointer">
                    Sign up
                </button>
            </div>
        </div>
    );
}