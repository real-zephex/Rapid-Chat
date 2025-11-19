"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { FaBolt, FaRobot, FaShieldAlt, FaMagic, FaBrain, FaCode, FaGlobe } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import Link from "next/link";

const AboutPage = () => {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    return (
        <main className="min-h-screen bg-neutral-950 text-white overflow-y-auto relative selection:bg-blue-500/30">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[150px]" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32 space-y-32"
            >
                {/* Hero Section */}
                <section className="text-center space-y-8 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4"
                    >
                        <HiSparkles className="text-yellow-400" />
                        <span className="text-sm font-medium text-neutral-300">The Next Gen Chat Interface</span>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-6xl md:text-8xl font-bold tracking-tight"
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-neutral-500">
                            Rapid Chat
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Experience the future of conversation. Lightning-fast responses, multi-model intelligence, and privacy by design.
                    </motion.p>

                    <motion.div variants={itemVariants} className="pt-8">
                        <Link
                            href="/"
                            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg transition-transform hover:scale-105 active:scale-95"
                        >
                            <span>Start Chatting</span>
                            <FaBolt className="group-hover:text-yellow-600 transition-colors" />
                            <div className="absolute inset-0 rounded-full bg-white/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </motion.div>
                </section>

                {/* Bento Grid Features */}
                <section className="space-y-12">
                    <motion.h2 variants={itemVariants} className="text-4xl font-bold text-center">
                        Power & Precision
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
                        {/* Large Feature */}
                        <BentoCard
                            className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10"
                            icon={<FaRobot className="text-5xl text-blue-400" />}
                            title="Multi-Model Intelligence"
                            description="Access a curated selection of the world's most advanced AI models. Switch seamlessly between Gemini, Llama, Qwen, and more to find the perfect brain for your task."
                            variants={itemVariants}
                        />

                        {/* Standard Features */}
                        <BentoCard
                            className="bg-neutral-900/50"
                            icon={<FaBolt className="text-3xl text-yellow-400" />}
                            title="Lightning Fast"
                            description="Optimized for speed. No more waiting for the typing indicator."
                            variants={itemVariants}
                        />
                        <BentoCard
                            className="bg-neutral-900/50"
                            icon={<FaShieldAlt className="text-3xl text-green-400" />}
                            title="Privacy First"
                            description="Local storage. Your data stays in your browser."
                            variants={itemVariants}
                        />

                        {/* Wide Feature */}
                        <BentoCard
                            className="md:col-span-3 bg-neutral-900/50"
                            icon={<FaMagic className="text-4xl text-purple-400" />}
                            title="Beyond Text"
                            description="Upload images for analysis, drop PDF documents for summarization, or use voice input for hands-free interaction. Rapid Chat handles it all."
                            variants={itemVariants}
                            layout="horizontal"
                        />
                    </div>
                </section>

                {/* Available Models - Tag Cloud */}
                <section className="space-y-12">
                    <motion.h2 variants={itemVariants} className="text-4xl font-bold text-center">
                        Supported Models
                    </motion.h2>

                    <motion.div
                        variants={itemVariants}
                        className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
                    >
                        {[
                            { name: "Gemini 2.0 Flash", icon: <FaBrain /> },
                            { name: "Llama Scout", icon: <FaRobot /> },
                            { name: "Qwen 3 32B", icon: <FaGlobe /> },
                            { name: "Gemini Flash", icon: <FaBrain /> },
                            { name: "Venice", icon: <FaCode /> },
                            { name: "NVIDIA Nemotron", icon: <FaBolt /> },
                            { name: "GPT OSS 20B", icon: <FaRobot /> },
                            { name: "Mistral Small", icon: <FaBrain /> },
                            { name: "Kimi K2", icon: <FaGlobe /> },
                            { name: "Kat Coder Pro", icon: <FaCode /> },
                        ].map((model, idx) => (
                            <motion.div
                                key={model.name}
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-neutral-300 cursor-default transition-colors"
                            >
                                <span className="text-neutral-500">{model.icon}</span>
                                <span className="font-medium">{model.name}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* Footer */}
                <motion.footer variants={itemVariants} className="text-center pt-20 border-t border-white/5">
                    <p className="text-neutral-500 text-sm">
                        Designed & Built for the Future.
                    </p>
                    <p className="text-neutral-600 text-xs mt-2">
                        Powered by Next.js 15 & Tailwind CSS
                    </p>
                </motion.footer>
            </motion.div>
        </main>
    );
};

interface BentoCardProps {
    className?: string;
    icon: React.ReactNode;
    title: string;
    description?: React.ReactNode | string;
    variants?: Variants;
    layout?: 'vertical' | 'horizontal';
}

const BentoCard = ({ className, icon, title, description, variants, layout = 'vertical' }: BentoCardProps) => {
    const isHorizontal = layout === 'horizontal';

    return (
        <motion.div
            variants={variants}
            className={`p-8 rounded-3xl border border-white/5 backdrop-blur-md hover:border-white/10 transition-colors group ${className}`}
        >
            <div className={`h-full flex ${isHorizontal ? 'flex-col md:flex-row items-center gap-8' : 'flex-col justify-between space-y-4'
                }`}>
                <div className="bg-white/5 w-fit p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-neutral-400 leading-relaxed">{description}</p>
                </div>
            </div>
        </motion.div>
    );
};

export default AboutPage;
