import { motion } from "framer-motion";
import { SiX, SiFacebook, SiGithub, SiBlogger, SiTelegram } from "react-icons/si";
import { Card } from "@/components/ui/card";

const links = [
  { name: "X (Twitter)", url: "https://x.com/vccmac?s=21", icon: SiX, color: "from-[#ff6b6b] to-[#ffd93d]" },
  { name: "Facebook", url: "https://www.facebook.com/share/1HLK5U5GxR/?mibextid=wwXIfr", icon: SiFacebook, color: "from-[#4facfe] to-[#00f2fe]" },
  { name: "GitHub", url: "https://github.com/cmiller9851-wq", icon: SiGithub, color: "from-[#667eea] to-[#764ba2]" },
  { name: "Blogger", url: "http://swervincurvin.blogspot.com/", icon: SiBlogger, color: "from-[#f093fb] to-[#f5576c]" },
  { name: "Telegram Bot", url: "https://t.me/cra_harvester_bot", icon: SiTelegram, color: "from-[#a1c4fd] to-[#c2e9fb]" },
  { name: "Support Agent", url: "https://t.me/swervin_curvin", icon: SiTelegram, color: "from-[#8e9eab] to-[#eef2f3]" },
];

export default function SocialLinks() {
  return (
    <div className="h-full w-full relative overflow-hidden bg-[#121212] flex flex-col items-center justify-center p-8">
      {/* Background Particles Simulation */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/20 rounded-full"
            initial={{ 
              x: `${Math.random() * 100}vw`, 
              y: "110vh",
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2
            }}
            animate={{ 
              y: "-10vh",
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-bold mb-12 text-[#ffeb3b] tracking-widest uppercase text-center drop-shadow-[0_0_10px_rgba(255,235,59,0.5)]"
      >
        Connect With Me
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full z-10">
        {links.map((link, index) => (
          <motion.a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <Card className={`p-6 flex items-center gap-4 bg-gradient-to-br ${link.color} border-none shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl rounded-2xl`}>
              <link.icon className="w-8 h-8 text-white" />
              <span className="text-xl font-semibold text-white">{link.name}</span>
            </Card>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
