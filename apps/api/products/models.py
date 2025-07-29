from django.db import models

class AIProduct(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to="product_images/", null=True, blank=True)
    url = models.URLField(help_text="Link to the product page")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
