'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ShieldCheck, User, KeyRound, ArrowRight } from 'lucide-react';

import Image from 'next/image';
import logoImg from '../../public/logo.png';
import dozzerImg from '../../public/dozzer.png';
import excavatorImg from '../../public/excavator.png';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password. Please try again.');
        setIsSubmitting(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred during authentication.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#fbfaf8] relative flex flex-col justify-center items-center px-4 overflow-hidden">
      
      {/* Decorative Machinery Images */}
      <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 w-[300px] xl:w-[450px] opacity-95 pointer-events-none z-0">
        <Image src={dozzerImg} alt="Construction Dozer" className="w-full h-auto object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)]" priority />
      </div>
      <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-[300px] xl:w-[450px] opacity-95 pointer-events-none z-0">
        <Image src={excavatorImg} alt="Construction Excavator" className="w-full h-auto object-contain" priority />
      </div>
      
      {/* Container */}
      <div className="max-w-md w-full space-y-8 animate-fade-in relative z-10">
        
        {/* Brand Card Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-4 drop-shadow-md">
            <Image src={logoImg} alt="Mesael Construction Logo" className="w-24 h-auto object-contain" priority />
          </div>
          <div>
            <h1 className="font-serif text-4xl font-bold text-[#15181e] tracking-tight">
              Mesael Construction
            </h1>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mt-2">
              Operations Platform — Enterprise Portal
            </p>
          </div>
        </div>

        {/* Login Form Panel */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-5">
            <h2 className="text-xl font-bold text-[#15181e]">Account Sign In</h2>
            <span className="text-xs font-bold text-[#c1540f] bg-[#fdf1e7] border border-[#f3d3b3] px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Secure Access
            </span>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Corporate Email
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-base text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#c1540f] font-medium"
                  placeholder="user@mesael.et"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-base text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#c1540f] font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#15181e] hover:bg-[#c1540f] text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 group mt-2"
            >
              <span>{isSubmitting ? 'Authenticating…' : 'Sign In'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

        </div>

        {/* Footer info */}
        <div className="text-center text-sm font-medium text-gray-400">
          Mesael Construction Operations Platform · Protected Enterprise System
        </div>

      </div>
    </div>
  );
}
