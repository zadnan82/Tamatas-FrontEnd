export default function UIComponentsDemo() {
  const [selectedCategory, setSelectedCategory] = useState('fruits');
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">Fresh Trade UI Components</h1>
      
      {/* Cards Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Product Card</CardTitle>
          <CardDescription>Fresh organic tomatoes from local farm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>FT</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">Fresh Tomatoes</p>
              <p className="text-sm text-gray-500">$4.50 per pound</p>
            </div>
            <Badge className="ml-auto">Organic</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Select Demo */}
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category">
              {selectedCategory === 'fruits' && 'Fruits'}
              {selectedCategory === 'vegetables' && 'Vegetables'}
              {selectedCategory === 'herbs' && 'Herbs'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fruits">Fruits</SelectItem>
            <SelectItem value="vegetables">Vegetables</SelectItem>
            <SelectItem value="herbs">Herbs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Checkbox Demo */}
      <div className="flex items-center space-x-2">
        <Checkbox 
          checked={isChecked} 
          onCheckedChange={setIsChecked}
        />
        <Label>Organic produce only</Label>
      </div>

      {/* Accordion Demo */}
      <Accordion type="single" defaultValue="filters">
        <AccordionItem value="filters">
          <AccordionTrigger>Search Filters</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <Label>Price Range</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-5">$0 - $5</SelectItem>
                    <SelectItem value="5-10">$5 - $10</SelectItem>
                    <SelectItem value="10+">$10+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Carousel Demo */}
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-semibold">Product Image 1</span>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
          <CarouselItem>
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">Product Image 2</span>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}