<!DOCTYPE html>
<html lang="de" x-data="{ lang: 'de' }">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dan Dreßen | CV & Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        [x-cloak] { display: none !important; }
        body { background: #050505; color: #fff; font-family: 'Space Grotesk', sans-serif; line-height: 1.5; }
        .air-card { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 1rem; padding: 1.5rem; }
        .skill-tag { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 2px 8px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
        
        @media print {
            @page { size: A4; margin: 1cm; }
            body { background: white !important; color: black !important; font-size: 9.5pt; }
            .no-print { display: none !important; }
            .air-card { background: none !important; border: 1px solid #eee !important; color: black !important; padding: 1rem; margin-bottom: 1rem; break-inside: avoid; }
            .text-blue-500, .skill-tag { color: #1d4ed8 !important; border-color: #1d4ed8 !important; }
            .text-gray-400, .text-gray-500 { color: #444 !important; }
            a { text-decoration: underline; color: #1d4ed8 !important; }
            h1 { font-size: 26pt; }
            h3 { border-bottom: 2px solid #1d4ed8; padding-bottom: 4px; margin-top: 1.5rem; }
        }
    </style>
</head>
<body class="antialiased">

    <nav class="no-print fixed top-0 w-full z-50 px-8 py-4 flex justify-between items-center bg-black/80 backdrop-blur-md border-b border-white/5">
        <div class="font-bold tracking-tighter text-lg uppercase">Dan <span class="text-blue-500">Dreßen</span></div>
        <div class="flex gap-4 items-center">
            <div class="flex gap-2 text-[10px] font-bold uppercase tracking-widest">
                <button @click="lang = 'de'" :class="lang === 'de' ? 'text-blue-500' : 'text-gray-500'">DE</button>
                <button @click="lang = 'en'" :class="lang === 'en' ? 'text-blue-500' : 'text-gray-500'">EN</button>
            </div>
            <button @click="window.print()" class="bg-white text-black text-[10px] px-4 py-2 rounded uppercase font-bold hover:bg-blue-500 hover:text-white transition-all">PDF Export</button>
        </div>
    </nav>

    <main class="pt-24 pb-20 px-6 max-w-6xl mx-auto">
        
        <header class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 border-b border-white/10 pb-12">
            <div class="md:col-span-3">
                <h1 class="text-6xl font-bold tracking-tighter uppercase mb-2">Dan <span class="text-blue-500">Dreßen</span></h1>
                <p class="text-blue-500 font-bold uppercase tracking-widest text-xs mb-6" x-text="lang === 'de' ? 'IT Support Specialist | Staatlich geprüfter Übersetzer' : 'IT Support Specialist | State-Certified Translator'"></p>
                
                <div class="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span>München, DE</span>
                    <span>dan.dressen@pm.me</span>
                    <a href="https://linkedin.com/in/dandressen" class="hover:text-blue-500 underline decoration-blue-500/30">LinkedIn</a>
                    <a href="https://github.com/dandressen" class="hover:text-blue-500 underline decoration-blue-500/30">GitHub</a>
                </div>
            </div>
            <div class="hidden md:block">
                <img src="me.jpg" class="w-32 h-32 rounded-2xl grayscale border border-white/10 object-cover float-right shadow-2xl transition-all duration-700 hover:grayscale-0" onerror="this.src='PassBild_jpg.jpg'">
            </div>
        </header>

        <section class="mb-12">
            <h3 class="text-blue-500 font-bold uppercase tracking-[0.3em] text-xs mb-6" x-text="lang === 'de' ? 'Über Mich' : 'About Me'"></h3>
            <div class="air-card text-sm text-gray-300 leading-relaxed">
                <p x-text="lang === 'de' ? 'Als IT-Spezialist verfüge ich über praktische Berufserfahrung im First- und Second-Level-Support sowie fundierte Kenntnisse in der Systemadministration. Durch meine vierjährige Dienstzeit bei der Bundeswehr und meine Tätigkeit bei Hengeler Mueller bin ich mit den spezifischen Anforderungen strukturierter IT-Umgebungen vertraut. Meine praktischen Systemadministrationsfähigkeiten entwickle ich kontinuierlich weiter, indem ich eine umfassende Homelab-Infrastruktur mit über 40 containerisierten Services auf produktivem Niveau betreibe.' : 'As an IT specialist, I have practical professional experience in first and second-level support and sound knowledge of system administration. Through my four years of service in the German Armed Forces and my work at Hengeler Mueller, I am familiar with the specific requirements of structured IT environments. I continuously develop my practical system administration skills by operating a comprehensive home lab infrastructure with over 40 containerized services.'"></p>
            </div>
        </section>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div class="lg:col-span-2 space-y-12">
                
                <section>
                    <h3 class="text-blue-500 font-bold uppercase tracking-[0.3em] text-xs mb-8" x-text="lang === 'de' ? 'Bildungsweg' : 'Education'"></h3>
                    <div class="space-y-8">
                        <div class="relative pl-8 border-l border-white/10">
                            <div class="absolute -left-[4.5px] top-0 w-2 h-2 rounded-full bg-gray-700"></div>
                            <div class="flex justify-between font-bold text-sm uppercase mb-1">
                                <span>SDI München</span>
                                <span class="text-gray-500 italic">2022 - 2024</span>
                            </div>
                            <p class="text-xs text-blue-500 font-bold uppercase mb-1" x-text="lang === 'de' ? 'Bachelor Professional in Übersetzen (DQR/EQR Level 6)' : 'Bachelor Professional in Translation (DQR/EQR Level 6)'"></p>
                            <p class="text-xs text-gray-400" x-text="lang === 'de' ? 'Schwerpunkt auf Rechts- und Wirtschaftstexte. Umfassende Kenntnisse in maschineller Übersetzung (SDL Trados Studio).' : 'Focus on legal and economic texts. Comprehensive knowledge in machine translation (SDL Trados Studio).'"></p>
                        </div>
                        <div class="relative pl-8 border-l border-white/10">
                            <div class="absolute -left-[4.5px] top-0 w-2 h-2 rounded-full bg-gray-700"></div>
                            <div class="flex justify-between font-bold text-sm uppercase mb-1">
                                <span>WDS Würzburg</span>
                                <span class="text-gray-500 italic">2012 - 2015</span>
                            </div>
                            <p class="text-xs text-blue-500 font-bold uppercase mb-1" x-text="lang === 'de' ? 'Staatlich geprüfter Fremdsprachenkorrespondent' : 'State-certified Foreign Language Correspondent'"></p>
                            <p class="text-xs text-gray-400" x-text="lang === 'de' ? 'Spezialisierung auf kaufmännische Korrespondenz in Englisch und Französisch.' : 'Specialization in commercial correspondence in English and French.'"></p>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 class="text-blue-500 font-bold uppercase tracking-[0.3em] text-xs mb-8" x-text="lang === 'de' ? 'Berufserfahrung' : 'Experience'"></h3>
                    <div class="space-y-10">
                        <div class="relative pl-8 border-l border-blue-500/30">
                            <div class="absolute -left-[4.5px] top-0 w-2 h-2 rounded-full bg-blue-500"></div>
                            <div class="flex justify-between font-bold text-sm uppercase mb-1">
                                <span x-text="lang === 'de' ? 'Reservist IT-Support' : 'Reservist IT Support'"></span>
                                <span class="text-gray-500 italic">06/2024 - 10/2024</span>
                            </div>
                            <p class="text-[10px] font-bold text-blue-500 uppercase mb-3">Bundeswehrkrankenhaus Ulm, IT-Abteilung (S6)</p>
                            <p class="text-xs text-gray-400" x-text="lang === 'de' ? 'First- und Second-Level-Support, Hardware-Setups, Incident Management im Ticketsystem.' : 'First and second-level support, hardware setups, incident management in the ticketing system.'"></p>
                        </div>

                        <div class="relative pl-8 border-l border-white/10">
                            <div class="flex justify-between font-bold text-sm uppercase mb-1">
                                <span x-text="lang === 'de' ? 'Empfangsmitarbeiter (IT-Fokus)' : 'Receptionist (IT Focus)'"></span>
                                <span class="text-gray-500 italic">06/2023 - 06/2024</span>
                            </div>
                            <p class="text-[10px] font-bold text-blue-500 uppercase mb-3">Hengeler Mueller, Rechtsanwälte</p>
                            <p class="text-xs text-gray-400" x-text="lang === 'de' ? 'Mandantenbetreuung und informeller First-Level-IT-Support in einer internationalen Großkanzlei.' : 'Client care and informal first-level IT support in an international major law firm.'"></p>
                        </div>

                        <div class="relative pl-8 border-l border-white/10">
                            <div class="flex justify-between font-bold text-sm uppercase mb-1">
                                <span x-text="lang === 'de' ? 'Zeitsoldat (SaZ 04)' : 'Regular Soldier (4y)'"></span>
                                <span class="text-gray-500 italic">04/2018 - 03/2022</span>
                            </div>
                            <p class="text-[10px] font-bold text-blue-500 uppercase mb-3">Bundeswehr, Sanitätsunterstützungszentrum München</p>
                            <p class="text-xs text-gray-400" x-text="lang === 'de' ? 'SASPF Z-San (SAP) Key-User, De-facto IT-Ansprechpartner, Microsoft Office Specialist (MOS) Zertifizierung.' : 'SASPF Z-San (SAP) Key-User, De-facto IT contact, Microsoft Office Specialist (MOS) certification.'"></p>
                        </div>
                    </div>
                </section>
            </div>

            <div class="space-y-10">
                <section class="air-card border-blue-500/20">
                    <h3 class="text-blue-500 font-bold uppercase text-[10px] tracking-widest mb-6" x-text="lang === 'de' ? 'Projekte & Infrastruktur' : 'Projects & Infrastructure'"></h3>
                    <div class="space-y-6">
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <h4 class="font-bold text-sm uppercase">Homelab</h4>
                                <span class="text-[8px] bg-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded font-bold uppercase">Live</span>
                            </div>
                            <p class="text-[10px] text-gray-400 mb-2" x-text="lang === 'de' ? '40+ containerisierte Services, ZFS, Wireguard, Pangolin Proxy, CrowdSec.' : '40+ containerized services, ZFS, Wireguard, Pangolin proxy, CrowdSec.'"></p>
                            <a href="https://github.com/dandressen" class="text-[9px] font-bold text-blue-500 hover:underline underline-offset-2 tracking-tighter uppercase">GitHub Repo →</a>
                        </div>
                        <div class="pt-4 border-t border-white/5">
                            <h4 class="font-bold text-sm uppercase mb-2">D-PlaneOS</h4>
                            <p class="text-[10px] text-gray-400 mb-2" x-text="lang === 'de' ? 'Docker-natives NAS-Betriebssystem auf Basis von ZFS und Debian.' : 'Docker-native NAS operating system based on ZFS and Debian.'"></p>
                            <a href="https://github.com/dandressen/D-PlaneOS" class="text-[9px] font-bold text-blue-500 hover:underline underline-offset-2 tracking-tighter uppercase">GitHub Repo →</a>
                        </div>
                    </div>
                </section>

                <section class="air-card">
                    <h3 class="text-blue-500 font-bold uppercase text-[10px] tracking-widest mb-6" x-text="lang === 'de' ? 'IT Expertise' : 'IT Expertise'"></h3>
                    <div class="space-y-6">
                        <div>
                            <p class="text-[9px] font-bold text-gray-500 uppercase mb-2">Support & Admin</p>
                            <div class="flex flex-wrap gap-1.5">
                                <template x-for="s in ['Windows 10/11', 'Linux (Debian)', 'Active Directory', 'O365', 'MDM', 'Hardware Repair']">
                                    <span class="skill-tag" x-text="s"></span>
                                </template>
                            </div>
                        </div>
                        <div>
                            <p class="text-[9px] font-bold text-gray-500 uppercase mb-2">Infrastructure</p>
                            <div class="flex flex-wrap gap-1.5">
                                <template x-for="s in ['Docker', 'ZFS', 'Wireguard', 'Pangolin', 'Proxmox', 'CrowdSec']">
                                    <span class="skill-tag" x-text="s"></span>
                                </template>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="air-card">
                    <h3 class="text-blue-500 font-bold uppercase text-[10px] tracking-widest mb-6" x-text="lang === 'de' ? 'Sprachen' : 'Languages'"></h3>
                    <div class="space-y-3 text-[11px] font-medium uppercase tracking-wider">
                        <div class="flex justify-between"><span>Deutsch</span><span class="text-blue-500 font-bold" x-text="lang === 'de' ? 'Muttersprache' : 'Native'"></span></div>
                        <div class="flex justify-between"><span>English</span><span class="text-blue-500 font-bold">C2</span></div>
                        <div class="flex justify-between"><span>Français</span><span class="text-blue-500 font-bold">C1</span></div>
                    </div>
                </section>
            </div>
        </div>
    </main>

    <footer class="no-print border-t border-white/5 py-10 text-center opacity-20 text-[8px] font-bold uppercase tracking-[0.5em]">
        d-net.me systems engine • 2026
    </footer>

</body>
</html>
