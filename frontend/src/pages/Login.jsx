import { useState } from 'react';
import { Bot, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Updated API URL to use the correct local server if needed, 
            // but assuming relative path works if proxied, or we fallback to localhost:3001
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            
            const response = await fetch(`${baseUrl}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                onLogin(data);
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch (err) {
            setError('Failed to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center items-center p-6">
            
            <div className="w-full max-w-md">
                {/* Logo Area */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-accent to-brand-600 flex items-center justify-center shadow-xl shadow-brand-200 mx-auto mb-6 transform transition-transform hover:scale-105 duration-300">
                        <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                        Looks Salon
                    </h1>
                    <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">
                        AI Receptionist Dashboard
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Welcome back</h2>
                        <p className="text-sm text-gray-500 mt-1">Please enter your details to sign in.</p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200 outline-none"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 block">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200 outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-accent hover:bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-200 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
                
                {/* Footer text */}
                <p className="text-center text-xs text-gray-400 mt-8 font-medium">
                    Secure Dashboard Access · Authorized Personnel Only
                </p>
            </div>
        </div>
    );
}
