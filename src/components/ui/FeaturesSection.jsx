import React from 'react';
import { Button } from './button';
import { Card } from './card';
import { ArrowUp, CalendarCheck, Globe, Play, Plus, Signature, Sparkles, Target, MessageSquare, ShoppingCart, Headset } from 'lucide-react';
import CustomersTableCard from './CustomersTableCard';

const MESCHAC_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
const BERNARD_AVATAR = 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80';
const THEO_AVATAR = 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80';
const GLODIE_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80';

export default function FeaturesSection() {
    return (
        <section className="bg-white">
            <div className="py-24">
                <div className="mx-auto w-full max-w-5xl px-6">
                    <div>
                        <h2 className="text-foreground max-w-2xl text-balance text-4xl font-semibold">Empowering businesses with AI-driven automation</h2>
                    </div>
                    <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card
                            variant="soft"
                            className="overflow-hidden p-6">
                            <MessageSquare className="text-primary size-5" />
                            <h3 className="text-foreground mt-5 text-lg font-semibold">WhatsApp Automation</h3>
                            <p className="text-muted-foreground mt-3 text-balance">Our advanced AI bots transform customer inquiries into actionable insights and automated responses directly on WhatsApp.</p>

                            <MeetingIllustration />
                        </Card>

                        <Card
                            variant="soft"
                            className="group overflow-hidden px-6 pt-6">
                            <ShoppingCart className="text-primary size-5" />
                            <h3 className="text-foreground mt-5 text-lg font-semibold">Order Management</h3>
                            <p className="text-muted-foreground mt-3 text-balance">Manage and track your customer orders seamlessly within your dedicated dashboard with real-time updates.</p>

                            <CodeReviewIllustration />
                        </Card>
                        <Card
                            variant="soft"
                            className="group overflow-hidden px-6 pt-6">
                            <Headset className="text-primary size-5" />
                            <h3 className="text-foreground mt-5 text-lg font-semibold">AI-Powered Support</h3>
                            <p className="text-muted-foreground mt-3 text-balance">A personalized AI companion that understands your business context to resolve issues instantly.</p>

                            <div className="mask-b-from-50 -mx-2 -mt-2 px-2 pt-2">
                                <AIAssistantIllustration />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}

const MeetingIllustration = () => {
    return (
        <Card
            aria-hidden
            className="mt-9 aspect-video p-4 bg-white">
            <div className="relative hidden h-fit">
                <div className="absolute -left-1.5 bottom-1.5 rounded-md border-t border-green-700 bg-green-500 px-1 py-px text-[10px] font-medium text-white shadow-md shadow-green-500/35">MSG</div>
                <div className="h-10 w-8 rounded-md border bg-gradient-to-b from-zinc-100 to-zinc-200"></div>
            </div>
            <div className="mb-0.5 text-sm font-semibold">Bot Interaction Setup</div>
            <div className="mb-4 flex gap-2 text-sm">
                <span className="text-muted-foreground">Active Campaign</span>
            </div>
            <div className="mb-2 flex -space-x-1.5">
                <div className="flex -space-x-1.5">
                    {[
                        { src: MESCHAC_AVATAR, alt: 'User 1' },
                        { src: BERNARD_AVATAR, alt: 'User 2' },
                        { src: THEO_AVATAR, alt: 'User 3' },
                        { src: GLODIE_AVATAR, alt: 'User 4' },
                    ].map((avatar, index) => (
                        <div
                            key={index}
                            className="bg-background size-7 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                            <img
                                className="aspect-square rounded-full object-cover"
                                src={avatar.src}
                                alt={avatar.alt}
                                height="460"
                                width="460"
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className="text-muted-foreground text-sm font-medium">Broadcast Audience Setup</div>
        </Card>
    )
}

const CodeReviewIllustration = () => {
    return (
        <div
            aria-hidden
            className="relative mt-6">
            <Card className="aspect-video w-4/5 translate-y-4 p-3 transition-transform duration-200 ease-in-out group-hover:-rotate-3 bg-white">
                <div className="mb-3 flex items-center gap-2">
                    <div className="bg-background size-6 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                        <img
                            className="aspect-square rounded-full object-cover"
                            src={MESCHAC_AVATAR}
                            alt="M Irung"
                            height="460"
                            width="460"
                        />
                    </div>
                    <span className="text-muted-foreground text-sm font-medium">Order #4092</span>

                    <span className="text-muted-foreground/75 text-xs">Processing</span>
                </div>

                <div className="ml-8 space-y-2">
                    <div className="bg-foreground/10 h-2 rounded-full"></div>
                    <div className="bg-foreground/10 h-2 w-3/5 rounded-full"></div>
                    <div className="bg-foreground/10 h-2 w-1/2 rounded-full"></div>
                </div>

                <Signature className="ml-8 mt-3 size-5" />
            </Card>
            <Card className="aspect-3/5 absolute -top-4 right-0 flex w-2/5 translate-y-4 p-2 transition-transform duration-200 ease-in-out group-hover:rotate-3 bg-white">
                <div className="bg-foreground/5 m-auto flex size-10 rounded-full">
                    <ShoppingCart className="fill-foreground/50 stroke-foreground/50 m-auto size-4" />
                </div>
            </Card>
        </div>
    )
}

const AIAssistantIllustration = () => {
    return (
        <Card
            aria-hidden
            className="mt-6 aspect-video translate-y-4 p-4 pb-6 transition-transform duration-200 group-hover:translate-y-0 bg-white">
            <div className="w-fit">
                <Sparkles className="size-3.5 fill-purple-300 stroke-purple-300" />
                <p className="mt-2 line-clamp-2 text-sm">How can I track my latest shipment or request a return process?</p>
            </div>
            <div className="bg-foreground/5 -mx-3 -mb-3 mt-3 space-y-3 rounded-lg p-3">
                <div className="text-muted-foreground text-sm">Ask AI Support</div>

                <div className="flex justify-between">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-7 rounded-2xl bg-transparent shadow-none">
                            <Plus />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-7 rounded-2xl bg-transparent shadow-none">
                            <Globe />
                        </Button>
                    </div>

                    <Button
                        size="icon"
                        className="size-7 rounded-2xl bg-green-500 text-white">
                        <ArrowUp strokeWidth={3} />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
