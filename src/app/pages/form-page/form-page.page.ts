import { Component } from '@angular/core';
import {
  IonContent, IonList, IonItem, IonLabel, IonInput, IonTextarea,
  IonSelect, IonSelectOption, IonCheckbox, IonRadioGroup, IonRadio,
  IonButton, IonDatetime, IonNote, IonSpinner, IonHeader, IonToolbar, IonTitle
} from '@ionic/angular/standalone';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, FormName, FormInput } from 'src/app/services/api.service';
import { PreferencesService } from 'src/app/services/preferences.service';

@Component({
  selector: 'app-form-page',
  templateUrl: './form-page.page.html',
  styleUrls: ['./form-page.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
    IonRadioGroup,
    IonRadio,
    IonButton,
    IonDatetime,
    IonNote,
    IonSpinner
]
})
export class FormPagePage {
  // Mantemos sempre string para evitar TS2322
  access_token: string = '';
  formId!: number;

  meta!: FormName;
  fg!: FormGroup;

  drivers: Array<{ id: number; name: string }> = [];
  vehicle_items: Array<{ id: number; license_plate: string }> = [];
  technicians: Array<{ id: number; name: string }> = [];

  photos: Record<number, string[]> = {};
  uploading: Record<number, boolean> = {};

  // <<< NOVO: propriedade que o template usa diretamente
  hasAnyUploading = false;

  loading = true;
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private prefs: PreferencesService,
    private fb: FormBuilder
  ) {
    this.formId = Number(this.route.snapshot.paramMap.get('id'));
  }

  async ngOnInit() {
    const tok = await this.prefs.checkName('access_token');
    // <<< CORRIGIDO: garantir string
    this.access_token = tok?.value ?? '';
    if (!this.access_token) { this.router.navigateByUrl('/home'); return; }

    this.api.form(this.access_token, this.formId).subscribe({
      next: (res: any) => {
        this.meta = res.data as FormName;
        this.drivers = res.drivers ?? [];
        this.vehicle_items = res.vehicle_items ?? [];
        this.technicians = res.technicians ?? [];
        this.buildForm();
        this.loading = false;
      },
      error: _ => { this.loading = false; }
    });
  }

  private buildForm() {
    const g: any = {};
    if (this.meta.has_driver) g['driver_id'] = [null, Validators.required];
    if (this.meta.has_license) g['vehicle_item_id'] = [null, Validators.required];
    if (this.meta.has_technician) g['user_id'] = [null, Validators.required];

    for (const fi of [...this.meta.form_inputs].sort((a, b) => a.position - b.position)) {
      const key = this.key(fi);
      switch (fi.type) {
        case 'checkbox': g[key] = [false, fi.required ? Validators.requiredTrue : []]; break;
        case 'radio': g[key] = ['Sim', fi.required ? Validators.required : []]; break;
        case 'photos': this.photos[fi.id] = []; break;
        default: g[key] = ['', fi.required ? Validators.required : []];
      }
    }
    this.fg = this.fb.group(g);
  }

  key(fi: FormInput) {
    const raw = (fi.name || fi.label || 'campo').toString();
    return raw.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
  }

  // <<< NOVO: função utilitária para recomputar a flag usada no template
  private recomputeHasAnyUploading(): void {
    this.hasAnyUploading = Object.values(this.uploading ?? {}).some(Boolean);
  }

  async onPickPhotos(fi: FormInput, files: FileList | null) {
    if (!files?.length) return;
    this.uploading[fi.id] = true;
    this.recomputeHasAnyUploading();

    const tasks = Array.from(files).map(file =>
      this.api.uploadPhoto(this.access_token, file).toPromise()
        .then((resp: any) => this.photos[fi.id].push(resp.name))
    );

    try {
      await Promise.all(tasks);
    } finally {
      this.uploading[fi.id] = false;
      this.recomputeHasAnyUploading();
    }
  }

  private normalizeDates(obj: any) {
    for (const fi of this.meta.form_inputs) {
      if (fi.type !== 'date') continue;
      const k = this.key(fi);
      const v = obj[k];
      if (typeof v === 'string' && v.includes('T')) obj[k] = v.slice(0, 10);
    }
    return obj;
  }

  submit() {
    if (!this.fg.valid) { this.fg.markAllAsTouched(); return; }
    if (this.hasAnyUploading) return;

    this.submitting = true;

    const inputs = this.normalizeDates({ ...this.fg.value });

    const payload: any = {
      form_name_id: this.meta.id,
      inputs,
      photos: this.photos,
    };
    if (this.meta.has_driver) payload.driver_id = inputs.driver_id;
    if (this.meta.has_license) payload.vehicle_item_id = inputs.vehicle_item_id;
    if (this.meta.has_technician) payload.user_id = inputs.user_id;

    delete inputs.driver_id; delete inputs.vehicle_item_id; delete inputs.user_id;

    this.api.submitForm(this.access_token, payload).subscribe({
      next: _ => { this.submitting = false; this.router.navigateByUrl('/tabs/tab3'); },
      error: _ => { this.submitting = false; }
    });
  }
}
