import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WhatsappTemplateService } from '../Services/whatsapp-service.service';
import { PropServiceService } from '../../services/prop-service.service';
import { RemoveBracesPipe } from '../Services/braces-transform.pipe';

@Component({
  selector: 'app-send-whatsapp',
  standalone: true,
  imports: [RouterModule, CommonModule,FormsModule,RemoveBracesPipe],
  templateUrl: './send-whatsapp.component.html',
  styleUrl: './send-whatsapp.component.css'
})


export class SendWhatsAppComponent implements OnInit {
  templateData: any;
  loading: boolean = true;
  previewText: string = '';
  fields: string[] = [];
  recipientNumber: string = '';

  constructor(
    private route: ActivatedRoute,
    private whatsappService: WhatsappTemplateService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const templateId = this.route.snapshot.paramMap.get('templateId');
    if (templateId) {
      this.getTemplate(templateId);
    } else {
      alert("Please select a template first");
    }
  }

  getTemplate(templateId: string): void {
    this.whatsappService.getSingleTemplate(templateId).subscribe(
      template => {
        this.templateData = template;
        this.loading = false;
        this.initializeFields();
        this.updatePreview();
      },
      error => {
        console.error('Error fetching template:', error);
        this.loading = false;
      }
    );
  }

  initializeFields(): void {
    const fieldCount = (this.templateData?.structure.body.text.match(/{{\d+}}/g) || []).length;
    this.fields = Array(fieldCount).fill('');
  }

  updatePreview() {
    if (!this.templateData?.structure.body.text) {
      return;
    }

    let updatedText = this.templateData.structure.body.text;

    this.fields.forEach((field, index) => {
      const placeholder = `{{${index + 1}}}`;
      updatedText = updatedText.replace(placeholder, field || placeholder);
    });

    this.previewText = updatedText;
  }

  sendMessage(): void {
    const messageBody = {
      from: "919027527049",
      to: this.recipientNumber,
      messageId: "a28dd97c-1ffb-4fcf-99f1-0b557ed381da",
      templateName: this.templateData.name,
      placeholders: this.fields,
      language: "en",
      callbackData: "Callback data",
      notifyUrl: "https://www.example.com/whatsapp"
    };

    this.whatsappService.sendMessage(messageBody).subscribe(
      messageResponse => {
        console.log("Message response:", messageResponse);
        alert("The message sent successfully.");
      },
      error => {
        console.error("Error sending message:", error);
        alert("Failed to send message. Please try again.");
      }
    );
  }
}
