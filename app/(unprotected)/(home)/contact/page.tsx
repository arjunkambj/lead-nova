"use client";

import { addToast, Button, Input, Textarea } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState } from "react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    addToast({
      title: "Message Sent",
      description: "We'll get back to you within 24 hours.",
      color: "success",
    });

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-default-900">
            Contact Us
          </h1>
          <p className="mt-3 text-default-600">
            Have questions? We&apos;re here to help.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Name"
              placeholder="Your name"
              variant="bordered"
              startContent={
                <Icon
                  icon="solar:user-linear"
                  className="text-default-400"
                  width={18}
                />
              }
              value={formData.name}
              onValueChange={(value) =>
                setFormData({ ...formData, name: value })
              }
              isRequired
            />
            <Input
              label="Email"
              placeholder="your@email.com"
              type="email"
              variant="bordered"
              startContent={
                <Icon
                  icon="solar:letter-linear"
                  className="text-default-400"
                  width={18}
                />
              }
              value={formData.email}
              onValueChange={(value) =>
                setFormData({ ...formData, email: value })
              }
              isRequired
            />
          </div>

          <Input
            label="Subject"
            placeholder="What is this about?"
            variant="bordered"
            startContent={
              <Icon
                icon="solar:chat-line-linear"
                className="text-default-400"
                width={18}
              />
            }
            value={formData.subject}
            onValueChange={(value) =>
              setFormData({ ...formData, subject: value })
            }
            isRequired
          />

          <Textarea
            label="Message"
            placeholder="Tell us more..."
            variant="bordered"
            minRows={5}
            value={formData.message}
            onValueChange={(value) =>
              setFormData({ ...formData, message: value })
            }
            isRequired
          />

          <Button
            type="submit"
            color="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            endContent={
              !isSubmitting && (
                <Icon icon="solar:arrow-right-linear" width={20} />
              )
            }
          >
            Send Message
          </Button>
        </form>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex p-3 rounded-xl bg-primary-50/50 mb-4">
              <Icon
                icon="solar:letter-bold"
                className="text-primary"
                width={24}
              />
            </div>
            <h3 className="font-semibold text-default-900 mb-1">Email</h3>
            <p className="text-sm text-default-600">support@leadnova.io</p>
          </div>

          <div className="text-center">
            <div className="inline-flex p-3 rounded-xl bg-primary-50/50 mb-4">
              <Icon
                icon="solar:chat-round-dots-bold"
                className="text-primary"
                width={24}
              />
            </div>
            <h3 className="font-semibold text-default-900 mb-1">Live Chat</h3>
            <p className="text-sm text-default-600">Available 9am-6pm EST</p>
          </div>

          <div className="text-center">
            <div className="inline-flex p-3 rounded-xl bg-primary-50/50 mb-4">
              <Icon
                icon="solar:phone-bold"
                className="text-primary"
                width={24}
              />
            </div>
            <h3 className="font-semibold text-default-900 mb-1">Phone</h3>
            <p className="text-sm text-default-600">+1 (555) 123-4567</p>
          </div>
        </div>
      </div>
    </div>
  );
}
