// File: AboutSection.tsx
// Path: /src/components/home/AboutSection.tsx
// About section explaining the platform - PLACEHOLDER

export default function AboutSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-gray-900 dark:text-white">
            [PLACEHOLDER: About Heading]
          </h2>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8">
            [PLACEHOLDER: Subheading about what makes Producers Avenue unique]
          </p>

          {/* Description */}
          <div className="text-lg text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              [PLACEHOLDER: Paragraph 1 - What is Producers Avenue and who is it for?]
            </p>
            <p>
              [PLACEHOLDER: Paragraph 2 - Key benefits and features overview]
            </p>
            <p>
              [PLACEHOLDER: Paragraph 3 - Community and collaboration focus]
            </p>
          </div>

          {/* Optional: Stats or highlights */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-heading font-bold text-primary mb-2">
                [10K+]
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Active Creators
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-heading font-bold text-primary mb-2">
                [50K+]
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Products & Services
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-heading font-bold text-primary mb-2">
                [100K+]
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Collaborations
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-12">
            <button className="btn-primary text-lg px-8 py-4">
              Join the Community
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}