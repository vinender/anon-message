import { useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../components/context/AuthContext';
import Dashboard from '@/components/dashboard';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChakraProvider, Box, Flex, VStack, Heading, Text, extendTheme,Button, Image, SimpleGrid, Container, useColorModeValue } from '@chakra-ui/react';
import { InfiniteTestimonialCards } from '@/components/ui/infinite-testimonial-cards';
import { TextRevealCard } from '@/components/ui/text-reveal-card';
import WeighingScale from '@/components/ui/weigh-scale';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'black',
        color: 'white',
      },
    },
  },
});


const testimonial = [
  { quote: "AnonMessage has changed the way I communicate with my friends. It's fun and secure!", name: 'User A', title: 'test' },
  { quote: "I love the anonymity and the design is so futuristic!", name: 'User B', title: 'test 2' },
  { quote: "I love the anonymity and the design is so futuristic!", name: 'User B', title: 'test 2' },
  { quote: "I love the anonymity and the design is so futuristic!", name: 'User B', title: 'test 2' },
  { quote: "I love the anonymity and the design is so futuristic!", name: 'User B', title: 'test 2' },
]


export default function Home() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [dashboard, setDashboard] = useState(false);


  const [positiveMessages, setPositiveMessages] = useState(10);
  const [negativeMessages, setNegativeMessages] = useState(0);


  useEffect(() => {
    if (user) {
      setDashboard(true);
    }
  }, [user]);

  const bgGradient = useColorModeValue(
    'linear(to-br, gray.900, purple.900, violet.600)',
    'linear(to-br, gray.900, purple.800, violet.500)'
  );

  return (
    <ChakraProvider theme={theme}>
      {dashboard ? (
        <Dashboard />
      ) : (

         
        <Box minH="100vh" bgGradient={bgGradient} color="white">
          <Container maxW="container.xl">
                <WeighingScale positiveMessages={70} negativeMessages={200} />
            {/* Header */}
            <Flex as="header" align="center" justify="space-between" wrap="wrap" py={6}>
              <Heading as="h1" size="xl" fontWeight="bold">
                AnonMessage
              </Heading>
              <Box>
                <Button as={Link} href="/signup" variant="ghost" mr={4} _hover={{ color: 'purple.300' }}>
                  Sign Up
                </Button>
                <Button as={Link} href="/login" variant="outline" _hover={{ bg: 'purple.700' }}>
                  Login
                </Button>
              </Box>
            </Flex>
            

            {/* Hero Section */}
            <VStack as="section" spacing={8} textAlign="center" py={20}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <Heading as="h2" size="4xl" fontWeight="extrabold" lineHeight="shorter">
                <TextRevealCard revealText={'Stay Anonymous'} text={'Hey you are.....'}/>
                </Heading>
              </motion.div>
              <Text fontSize="xl" maxW="2xl">
                Send and receive anonymous messages from your friends in a secure and fun way.
              </Text>
              <Button
                as={Link}
                href="/signup"
                size="lg"
                colorScheme="purple"
                fontWeight="bold"
                px={8}
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              >
                Get Started
              </Button>
            </VStack>

            {/* Features Section */}
            <Box as="section" py={16} bg="gray.800" borderRadius="xl" my={16}>
              <VStack spacing={12}>
                <Heading as="h3" size="2xl" fontWeight="bold">
                  Features
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} px={8}>
                  {[
                    { title: 'Anonymity', description: 'Stay anonymous while connecting with friends and others.', icon: '/images/anonymity.svg' },
                    { title: 'Security', description: 'Your messages are encrypted and secure.', icon: '/images/security.svg' },
                    { title: 'Community', description: 'Join a growing community of anonymous users.', icon: '/images/community.svg' },
                  ].map((feature, index) => (
                    <VStack key={index} align="center" p={6} bg="gray.700" borderRadius="lg" boxShadow="md">
                      <Image src={feature.icon} alt={feature.title} boxSize="50px" mb={4} />
                      <Heading as="h4" size="md" fontWeight="semibold">
                        {feature.title}
                      </Heading>
                      <Text textAlign="center">{feature.description}</Text>
                    </VStack>
                  ))}
                </SimpleGrid>
              </VStack>
            </Box>

            {/* Testimonials Section */}
            {/* <Box as="section" py={16}> */}
              <InfiniteTestimonialCards items={testimonial} />
              

            {/* Call to Action Section */}
            <Box as="section" textAlign="center" py={16} bg="purple.700" borderRadius="xl" my={16}>
              <VStack spacing={6}>
                <Heading as="h3" size="2xl" fontWeight="bold">
                  Ready to Experience AnonMessage?
                </Heading>
                <Button
                  as={Link}
                  href="/signup"
                  size="lg"
                  colorScheme="white"
                  color="purple.700"
                  px={8}
                  fontWeight="bold"
                  _hover={{ bg: 'gray.200', transform: 'translateY(-2px)', boxShadow: 'lg' }}
                >
                  Create Your Free Account
                </Button>
              </VStack>
            </Box>

            {/* Footer */}
            <Box as="footer" textAlign="center" py={8} bg="gray.900" borderRadius="xl">
              <Text>&copy; {new Date().getFullYear()} AnonMessage. All rights reserved.</Text>
            </Box>
          </Container>
        </Box>
      )}
    </ChakraProvider>
  );
}