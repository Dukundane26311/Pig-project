"use client";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-brand-950 text-brand-200 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🐷</span>
              <div>
                <p className="font-bold text-white font-serif text-lg">Pig Project Revolving Fund</p>
                <p className="text-sm text-brand-400">Value Protocols Rwanda</p>
              </div>
            </div>
            <p className="text-sm text-brand-300 max-w-xs leading-relaxed">
              One Piglet. One Family. A Fund That Keeps Moving. Empowering vulnerable families across Rwanda through sustainable livestock farming.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Program</h3>
            <ul className="space-y-2 text-sm">
              {[["About", "/about"],["How It Works","/how-it-works"],["Our Impact","/impact"],["Stories","/stories"],["Gallery","/gallery"]].map(([l,h])=>(
                <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Organization</h3>
            <ul className="space-y-2 text-sm">
              {[["Our Team","/team"],["Reports","/reports"],["Contact","/contact"],["Staff Login","/login"]].map(([l,h])=>(
                <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-brand-800 text-xs text-brand-500 flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} Value Protocols Rwanda. All rights reserved.</p>
          <p>Kigali, Rwanda · <a href="mailto:info@valueprotocols.rw" className="hover:text-white transition-colors">info@valueprotocols.rw</a></p>
        </div>
      </div>
    </footer>
  );
}
