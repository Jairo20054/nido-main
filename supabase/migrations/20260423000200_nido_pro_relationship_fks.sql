begin;

alter table public.prequalification_results
  add constraint prequalification_results_application_id_fkey
    foreign key (application_id) references public.applications (id) on delete cascade,
  add constraint prequalification_results_property_id_fkey
    foreign key (property_id) references public.properties (id) on delete cascade;

alter table public.applications
  add constraint applications_prequalification_result_id_fkey
    foreign key (prequalification_result_id) references public.prequalification_results (id) on delete set null;

alter table public.document_requirements
  add constraint document_requirements_template_id_fkey
    foreign key (template_id) references public.document_requirement_templates (id) on delete set null;

commit;
